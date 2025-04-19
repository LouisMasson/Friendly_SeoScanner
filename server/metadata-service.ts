import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import { db } from './db';
import { metadataJobs, type InsertMetadataJob } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { 
  BulkMetadataRequest, 
  BulkMetadataResponse, 
  GeneratedMetadata,
  JobStatus,
  PageData
} from '@shared/types';

/**
 * Service for AI-powered metadata generation
 */
export const metadataService = {
  /**
   * Create a new metadata generation job
   * @param request Job configuration
   * @param userId User ID
   * @returns Job status with ID
   */
  async createJob(request: BulkMetadataRequest, userId?: number): Promise<JobStatus> {
    // Generate a unique job ID
    const jobId = uuidv4();
    
    // Create job record in database
    await db.insert(metadataJobs).values({
      jobId,
      status: 'queued',
      progress: 0,
      data: request as any,
      userId: userId || null,
    });
    
    // Start processing asynchronously (don't await)
    this.processJobAsync(jobId);
    
    // Return job status
    return {
      jobId,
      status: 'queued',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  /**
   * Process a metadata generation job asynchronously
   * @param jobId Job ID
   */
  async processJobAsync(jobId: string): Promise<void> {
    try {
      // Update job status to processing
      await this.updateJobStatus(jobId, 'processing', 0, 'Starting processing');
      
      // Get job configuration from database
      const job = await this.getJob(jobId);
      if (!job) {
        throw new Error('Job not found');
      }
      
      const request = job.data as unknown as BulkMetadataRequest;
      const totalPages = request.pages.length;
      
      // Process pages in batches of 10 to avoid overloading the API
      const batchSize = 10;
      const results: GeneratedMetadata[] = [];
      
      for (let i = 0; i < totalPages; i += batchSize) {
        const batch = request.pages.slice(i, i + batchSize);
        const batchResults = await this.processBatch(batch, request.options);
        results.push(...batchResults);
        
        // Update progress
        const progress = Math.min(Math.round(((i + batch.length) / totalPages) * 100), 99);
        await this.updateJobStatus(jobId, 'processing', progress, `Processed ${i + batch.length} of ${totalPages} pages`);
      }
      
      // Calculate average score
      const averageScore = results.reduce((sum, item) => sum + item.score, 0) / results.length;
      
      // Generate summary with suggested improvements
      const suggestedImprovements = this.generateSuggestedImprovements(results);
      
      // Create final response
      const response: BulkMetadataResponse = {
        results,
        summary: {
          totalPages,
          processedPages: results.length,
          averageScore,
          suggestedImprovements,
        },
        jobId,
        status: 'completed',
      };
      
      // Save results and update job status
      await this.saveJobResults(jobId, response);
      
    } catch (error) {
      console.error('Error processing metadata job:', error);
      await this.updateJobStatus(
        jobId, 
        'failed', 
        0, 
        `Job failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  /**
   * Process a batch of pages
   * @param pages Batch of pages to process
   * @param options Processing options
   * @returns Generated metadata for each page
   */
  async processBatch(
    pages: PageData[], 
    options: BulkMetadataRequest['options']
  ): Promise<GeneratedMetadata[]> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      throw new Error("DeepSeek API key not found");
    }
    
    try {
      // Create prompt for DeepSeek
      const prompt = this.createPrompt(pages, options);
      
      // Make request to DeepSeek API
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are an expert SEO consultant who generates optimized title tags, meta descriptions, and structured data for websites."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          response_format: { type: "json_object" }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepSeek API error:", errorText);
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json() as any;
      
      // Extract the JSON response from the AI
      const aiResponseText = data.choices[0].message.content;
      let aiResponse: any;
      
      try {
        // Parse the JSON from the AI response
        aiResponse = JSON.parse(aiResponseText);
      } catch (error) {
        console.error("Failed to parse AI response:", error);
        throw new Error("Failed to parse AI response");
      }
      
      // Validate and format the response
      return this.validateAndFormatResponse(aiResponse, pages);
      
    } catch (error) {
      console.error("Error generating metadata:", error);
      
      // Return error results for each page
      return pages.map(page => ({
        url: page.url,
        title: page.existingMetaTitle || 'Error generating title',
        description: page.existingMetaDescription || 'Error generating description',
        jsonLd: '{}',
        score: 0,
        validationIssues: [error instanceof Error ? error.message : 'Unknown error'],
      }));
    }
  },

  /**
   * Create a prompt for the DeepSeek API
   * @param pages Pages to process
   * @param options Processing options
   * @returns Formatted prompt
   */
  createPrompt(pages: PageData[], options: BulkMetadataRequest['options']): string {
    const jsonLdType = options.jsonLdType || 'WebPage';
    const maxTitleLength = options.maxTitleLength || 60;
    const maxDescriptionLength = options.maxDescriptionLength || 160;
    
    let prompt = `
Generate optimized SEO metadata for the following web pages. For each page, provide:
1. A compelling title tag (max ${maxTitleLength} characters)
2. An informative meta description (max ${maxDescriptionLength} characters)
3. Valid JSON-LD structured data as a ${jsonLdType} type

Optimization goals:
- Optimize for: ${options.optimizeFor}
${options.industry ? `- Industry: ${options.industry}` : ''}
${options.targetKeywords?.length ? `- Target keywords: ${options.targetKeywords.join(', ')}` : ''}

Follow these guidelines:
- Titles should be compelling and include main keywords near the beginning
- Descriptions should include a clear call-to-action and relevant keywords
- JSON-LD should follow Google's structured data guidelines
- All output must be valid and properly escaped JSON

Pages to optimize:
`;

    // Add each page to the prompt
    pages.forEach((page, index) => {
      prompt += `\n--- Page ${index + 1} ---\n`;
      prompt += `URL: ${page.url}\n`;
      if (page.title) prompt += `Page Title: ${page.title}\n`;
      if (page.existingMetaTitle) prompt += `Current Meta Title: ${page.existingMetaTitle}\n`;
      if (page.existingMetaDescription) prompt += `Current Meta Description: ${page.existingMetaDescription}\n`;
      if (page.headings?.length) prompt += `Main Headings: ${page.headings.join(' | ')}\n`;
      if (page.content) {
        // Limit content to prevent exceeding token limits
        const limitedContent = page.content.substring(0, 500) + (page.content.length > 500 ? '...' : '');
        prompt += `Content Excerpt: ${limitedContent}\n`;
      }
    });

    prompt += `\nFormat your response as a JSON object with the following structure:
{
  "pages": [
    {
      "url": "https://example.com/page1",
      "title": "Optimized Title for Page 1",
      "description": "Compelling meta description with call to action.",
      "jsonLd": "{...valid JSON-LD as a string...}",
      "score": 85,
      "notes": ["Optional notes about the optimization"]
    }
  ]
}`;

    return prompt;
  },

  /**
   * Validate and format the AI response
   * @param response Raw AI response
   * @param originalPages Original page data
   * @returns Validated and formatted metadata
   */
  validateAndFormatResponse(response: any, originalPages: PageData[]): GeneratedMetadata[] {
    if (!response.pages || !Array.isArray(response.pages)) {
      throw new Error('Invalid AI response format');
    }

    return response.pages.map((page: any, index: number) => {
      // Match with original page
      const originalPage = originalPages[index] || { url: page.url };
      
      // Basic validation
      if (!page.url) page.url = originalPage.url;
      if (!page.title) page.title = originalPage.existingMetaTitle || 'Missing title';
      if (!page.description) page.description = originalPage.existingMetaDescription || 'Missing description';
      
      // JSON-LD validation
      let jsonLd = page.jsonLd || '{}';
      let validationIssues: string[] = [];
      
      try {
        // Make sure jsonLd is a string
        if (typeof jsonLd !== 'string') {
          jsonLd = JSON.stringify(jsonLd);
        }
        
        // Try to parse it to validate
        JSON.parse(jsonLd);
      } catch (error) {
        validationIssues.push('Invalid JSON-LD format');
        jsonLd = '{}';
      }
      
      // Validate title length
      if (page.title.length > 60) {
        validationIssues.push('Title exceeds recommended length (60 characters)');
      }
      
      // Validate description length
      if (page.description.length > 160) {
        validationIssues.push('Description exceeds recommended length (160 characters)');
      }
      
      return {
        url: page.url,
        title: page.title,
        description: page.description,
        jsonLd: jsonLd,
        score: page.score || 0,
        validationIssues: validationIssues.length ? validationIssues : undefined
      };
    });
  },

  /**
   * Generate suggested improvements based on validation issues
   * @param results Metadata generation results
   * @returns List of suggested improvements
   */
  generateSuggestedImprovements(results: GeneratedMetadata[]): string[] {
    const improvements: string[] = [];
    
    // Count issues by type
    const issueCount: Record<string, number> = {};
    
    results.forEach(result => {
      if (result.validationIssues?.length) {
        result.validationIssues.forEach(issue => {
          issueCount[issue] = (issueCount[issue] || 0) + 1;
        });
      }
      
      // Check title length
      if (result.title.length < 30) {
        issueCount['Title too short'] = (issueCount['Title too short'] || 0) + 1;
      }
      
      // Check description length
      if (result.description.length < 70) {
        issueCount['Description too short'] = (issueCount['Description too short'] || 0) + 1;
      }
    });
    
    // Add improvements based on issue counts
    for (const [issue, count] of Object.entries(issueCount)) {
      const percentage = Math.round((count / results.length) * 100);
      if (percentage > 20) {
        improvements.push(`${issue} (${percentage}% of pages)`);
      }
    }
    
    // Add general improvements
    improvements.push('Ensure all titles include primary keywords near the beginning');
    improvements.push('Include a clear call-to-action in meta descriptions');
    
    return improvements;
  },

  /**
   * Get a job by ID
   * @param jobId Job ID
   * @returns Job record
   */
  async getJob(jobId: string): Promise<any> {
    const jobs = await db.select().from(metadataJobs).where(eq(metadataJobs.jobId, jobId));
    return jobs[0];
  },

  /**
   * Update a job's status
   * @param jobId Job ID
   * @param status New status
   * @param progress Progress percentage
   * @param message Status message
   */
  async updateJobStatus(
    jobId: string, 
    status: 'queued' | 'processing' | 'completed' | 'failed', 
    progress: number,
    message?: string
  ): Promise<void> {
    await db.update(metadataJobs)
      .set({ 
        status, 
        progress, 
        message,
        updatedAt: new Date()
      })
      .where(eq(metadataJobs.jobId, jobId));
  },

  /**
   * Save job results
   * @param jobId Job ID
   * @param results Job results
   */
  async saveJobResults(jobId: string, results: BulkMetadataResponse): Promise<void> {
    await db.update(metadataJobs)
      .set({ 
        status: 'completed', 
        progress: 100, 
        message: 'Processing complete',
        data: results as any,
        updatedAt: new Date()
      })
      .where(eq(metadataJobs.jobId, jobId));
  },

  /**
   * Get job status
   * @param jobId Job ID
   * @returns Job status
   */
  async getJobStatus(jobId: string): Promise<JobStatus | null> {
    const jobs = await db.select().from(metadataJobs).where(eq(metadataJobs.jobId, jobId));
    
    if (!jobs.length) return null;
    
    const job = jobs[0];
    
    return {
      jobId: job.jobId,
      status: job.status as 'queued' | 'processing' | 'completed' | 'failed',
      progress: job.progress,
      message: job.message || undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      resultUrl: job.resultUrl || undefined
    };
  },

  /**
   * Get job results
   * @param jobId Job ID
   * @returns Job results
   */
  async getJobResults(jobId: string): Promise<BulkMetadataResponse | null> {
    const jobs = await db.select().from(metadataJobs).where(eq(metadataJobs.jobId, jobId));
    
    if (!jobs.length) return null;
    
    const job = jobs[0];
    
    if (job.status !== 'completed') {
      return {
        results: [],
        summary: {
          totalPages: 0,
          processedPages: 0,
          averageScore: 0,
          suggestedImprovements: [],
        },
        jobId,
        status: job.status as 'partial' | 'failed',
      };
    }
    
    return job.data as unknown as BulkMetadataResponse;
  },

  /**
   * Get user's metadata jobs
   * @param userId User ID
   * @param limit Maximum number of jobs to retrieve
   * @returns List of job statuses
   */
  async getUserJobs(userId: number, limit = 10): Promise<JobStatus[]> {
    const jobs = await db.select()
      .from(metadataJobs)
      .where(eq(metadataJobs.userId, userId))
      .orderBy(metadataJobs.updatedAt)
      .limit(limit);
    
    return jobs.map(job => ({
      jobId: job.jobId,
      status: job.status as 'queued' | 'processing' | 'completed' | 'failed',
      progress: job.progress,
      message: job.message || undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      resultUrl: job.resultUrl || undefined
    }));
  },
  
  /**
   * Validate metadata against Google's guidelines
   * @param metadata Metadata to validate
   * @returns Validation issues
   */
  validateAgainstGoogleGuidelines(metadata: GeneratedMetadata): string[] {
    const issues: string[] = [];
    
    // Title validation
    if (!metadata.title) {
      issues.push('Missing title tag');
    } else {
      if (metadata.title.length > 60) {
        issues.push('Title tag too long (should be 50-60 characters)');
      } else if (metadata.title.length < 30) {
        issues.push('Title tag too short (should be at least 30 characters)');
      }
    }
    
    // Description validation
    if (!metadata.description) {
      issues.push('Missing meta description');
    } else {
      if (metadata.description.length > 160) {
        issues.push('Meta description too long (should be 120-160 characters)');
      } else if (metadata.description.length < 70) {
        issues.push('Meta description too short (should be at least 70 characters)');
      }
    }
    
    // JSON-LD validation
    try {
      const jsonLd = JSON.parse(metadata.jsonLd);
      
      if (!jsonLd['@context'] || jsonLd['@context'] !== 'https://schema.org') {
        issues.push('JSON-LD missing proper @context (should be https://schema.org)');
      }
      
      if (!jsonLd['@type']) {
        issues.push('JSON-LD missing @type property');
      }
      
      // Check for required properties based on type
      switch (jsonLd['@type']) {
        case 'Article':
          if (!jsonLd.headline) issues.push('Article schema missing headline property');
          if (!jsonLd.author) issues.push('Article schema missing author property');
          break;
        case 'Product':
          if (!jsonLd.name) issues.push('Product schema missing name property');
          break;
        case 'LocalBusiness':
          if (!jsonLd.name) issues.push('LocalBusiness schema missing name property');
          if (!jsonLd.address) issues.push('LocalBusiness schema missing address property');
          break;
      }
    } catch (error) {
      issues.push('Invalid JSON-LD format');
    }
    
    return issues;
  },
  
  /**
   * Export results as CSV
   * @param results Metadata generation results
   * @returns CSV data as string
   */
  exportAsCSV(results: GeneratedMetadata[]): string {
    // CSV header
    const header = 'URL,Title,Description,JSON-LD,Score,Validation Issues\n';
    
    // CSV rows
    const rows = results.map(result => {
      // Escape CSV fields
      const escapeCSV = (field: string) => {
        if (!field) return '';
        return `"${field.replace(/"/g, '""')}"`;
      };
      
      return [
        escapeCSV(result.url),
        escapeCSV(result.title),
        escapeCSV(result.description),
        escapeCSV(result.jsonLd),
        result.score,
        escapeCSV(result.validationIssues?.join(', ') || '')
      ].join(',');
    });
    
    return header + rows.join('\n');
  },
  
  /**
   * Export results as JSON
   * @param results Metadata generation results
   * @returns JSON data as string
   */
  exportAsJSON(results: BulkMetadataResponse): string {
    return JSON.stringify(results, null, 2);
  }
};