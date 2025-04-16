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