import { SEOAnalysis } from '@shared/schema';

export type ToastType = 'success' | 'error' | 'loading';

export interface ToggleableProps {
  defaultOpen?: boolean;
  title: string;
  children: React.ReactNode;
}

export type SEOStatusType = 'good' | 'warning' | 'error';

export type StatusIcon = {
  [key in SEOStatusType]: React.ReactNode;
};

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

export type AnalysisResult = SEOAnalysis;
