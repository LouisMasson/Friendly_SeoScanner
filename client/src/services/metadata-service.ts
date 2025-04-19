import { 
  BulkMetadataRequest, 
  BulkMetadataResponse, 
  GeneratedMetadata, 
  JobStatus, 
  PageData 
} from '@shared/types';
import { apiRequest } from '@/lib/queryClient';

/**
 * Service for interacting with the metadata generation API
 */
export const MetadataService = {
  /**
   * Start a new metadata generation job
   * @param request Job configuration
   * @returns Job status with ID
   */
  async generateMetadata(request: BulkMetadataRequest): Promise<JobStatus> {
    try {
      const response = await apiRequest<{ jobId: string; status: JobStatus }>('/api/metadata/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });
      
      return response.status;
    } catch (error) {
      console.error("Error starting metadata generation job:", error);
      throw new Error("Failed to start metadata generation");
    }
  },

  /**
   * Get job status
   * @param jobId Job ID
   * @returns Job status
   */
  async getJobStatus(jobId: string): Promise<JobStatus> {
    try {
      const response = await apiRequest<JobStatus>(`/api/metadata/jobs/${jobId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      return response;
    } catch (error) {
      console.error("Error getting job status:", error);
      throw new Error("Failed to get job status");
    }
  },

  /**
   * Get job results
   * @param jobId Job ID
   * @returns Job results
   */
  async getJobResults(jobId: string): Promise<BulkMetadataResponse> {
    try {
      const response = await apiRequest<BulkMetadataResponse>(`/api/metadata/jobs/${jobId}/results`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      return response;
    } catch (error) {
      console.error("Error getting job results:", error);
      throw new Error("Failed to get job results");
    }
  },

  /**
   * Get user's jobs
   * @param limit Maximum number of jobs to retrieve
   * @returns List of job statuses
   */
  async getUserJobs(limit: number = 10): Promise<JobStatus[]> {
    try {
      const response = await apiRequest<JobStatus[]>(`/api/metadata/jobs?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      return response;
    } catch (error) {
      console.error("Error getting user jobs:", error);
      throw new Error("Failed to get user jobs");
    }
  },

  /**
   * Validate metadata against Google guidelines
   * @param metadata Metadata to validate
   * @returns Validation result
   */
  async validateMetadata(metadata: GeneratedMetadata): Promise<{ valid: boolean; issues: string[] }> {
    try {
      const response = await apiRequest<{ valid: boolean; issues: string[] }>('/api/metadata/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metadata })
      });
      
      return response;
    } catch (error) {
      console.error("Error validating metadata:", error);
      throw new Error("Failed to validate metadata");
    }
  },

  /**
   * Get the export URL for a job
   * @param jobId Job ID
   * @param format Export format (csv or json)
   * @returns Export URL
   */
  getExportUrl(jobId: string, format: 'csv' | 'json' = 'json'): string {
    return `/api/metadata/jobs/${jobId}/export?format=${format}`;
  },

  /**
   * Utility to extract text content from a webpage
   * @param url URL to extract content from
   * @returns Promise with page data
   */
  async extractPageContent(url: string): Promise<PageData> {
    try {
      // Use our API proxy to avoid CORS issues
      const response = await fetch('/api/metadata/extract-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Return the data directly if it's already in PageData format
      if (data.url && (data.title !== undefined)) {
        return data as PageData;
      }
      
      // Otherwise, parse the HTML if we received it
      const html = data.html;
      
      // Create a temporary DOM to parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract title
      const title = doc.title;
      
      // Extract headings
      const headings: string[] = [];
      doc.querySelectorAll('h1, h2, h3').forEach(heading => {
        if (heading.textContent?.trim()) {
          headings.push(heading.textContent.trim());
        }
      });
      
      // Extract main content (simplified approach)
      let content = '';
      const mainElement = doc.querySelector('main') || doc.querySelector('article') || doc.body;
      if (mainElement) {
        // Get paragraphs and combine them
        const paragraphs = mainElement.querySelectorAll('p');
        content = Array.from(paragraphs)
          .map(p => p.textContent?.trim())
          .filter(Boolean)
          .join(' ')
          .substring(0, 2000); // Limit content length
      }
      
      // Extract existing meta tags
      const existingMetaTitle = doc.querySelector('meta[name="title"]')?.getAttribute('content') || 
                               doc.querySelector('title')?.textContent || '';
      
      const existingMetaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      
      return {
        url,
        title,
        content,
        headings,
        existingMetaTitle,
        existingMetaDescription
      };
    } catch (error) {
      console.error("Error extracting page content:", error);
      return { url };
    }
  },

  /**
   * Extract URLs from sitemap.xml
   * @param sitemapUrl URL of the sitemap
   * @returns Array of URLs found in the sitemap
   */
  async extractUrlsFromSitemap(sitemapUrl: string): Promise<string[]> {
    try {
      // Use our API proxy to avoid CORS issues
      const response = await fetch('/api/metadata/extract-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: sitemapUrl }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sitemap: ${response.statusText}`);
      }
      
      const data = await response.json();
      const xml = data.html;
      
      // Create a temporary DOM to parse the XML
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      
      // Extract URLs
      const urls: string[] = [];
      doc.querySelectorAll('url > loc').forEach(loc => {
        if (loc.textContent) {
          urls.push(loc.textContent);
        }
      });
      
      return urls;
    } catch (error) {
      console.error("Error extracting URLs from sitemap:", error);
      throw new Error("Failed to extract URLs from sitemap");
    }
  }
};