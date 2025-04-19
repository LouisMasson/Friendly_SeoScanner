/**
 * Types shared between client and server
 */

export type SEOStatusType = 'good' | 'warning' | 'error';

export interface MetaTagEntry {
  type: string;
  content?: string;
  status: SEOStatusType;
  recommendation: string;
}

export interface RecommendationEntry {
  title: string;
  description: string;
  status: SEOStatusType;
  exampleCode?: string;
}

export interface AIRecommendationResponse {
  recommendations: RecommendationEntry[];
  summaryText: string;
}

/**
 * Page data structure for bulk SEO metadata generation
 */
export interface PageData {
  url: string;
  title?: string;
  content?: string;
  headings?: string[];
  existingMetaTitle?: string;
  existingMetaDescription?: string;
}

/**
 * Generated SEO metadata for a single page
 */
export interface GeneratedMetadata {
  url: string;
  title: string;
  description: string;
  jsonLd: string;
  score: number;
  validationIssues?: string[];
}

/**
 * Request for bulk metadata generation
 */
export interface BulkMetadataRequest {
  pages: PageData[];
  options: {
    optimizeFor: 'traffic' | 'conversions' | 'engagement';
    industry?: string;
    targetKeywords?: string[];
    maxTitleLength?: number;
    maxDescriptionLength?: number;
    includeJsonLd?: boolean;
    jsonLdType?: 'Article' | 'Product' | 'LocalBusiness' | 'Organization' | 'WebPage';
  };
}

/**
 * Response for bulk metadata generation
 */
export interface BulkMetadataResponse {
  results: GeneratedMetadata[];
  summary: {
    totalPages: number;
    processedPages: number;
    averageScore: number;
    suggestedImprovements: string[];
  };
  jobId?: string;
  status: 'completed' | 'partial' | 'failed';
}

/**
 * Job status for asynchronous bulk processing
 */
export interface JobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  resultUrl?: string;
}