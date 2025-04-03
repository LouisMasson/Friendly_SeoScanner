import { seoAnalysisSchema, type SEOAnalysis } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  saveAnalysis(analysis: SEOAnalysis): Promise<SEOAnalysis>;
  getAnalysisByUrl(url: string): Promise<SEOAnalysis | undefined>;
  getRecentAnalyses(limit: number): Promise<SEOAnalysis[]>;
}

// In-memory implementation
export class MemStorage implements IStorage {
  private analyses: Map<string, SEOAnalysis>;

  constructor() {
    this.analyses = new Map();
  }

  async saveAnalysis(analysis: SEOAnalysis): Promise<SEOAnalysis> {
    this.analyses.set(analysis.url, analysis);
    return analysis;
  }

  async getAnalysisByUrl(url: string): Promise<SEOAnalysis | undefined> {
    return this.analyses.get(url);
  }

  async getRecentAnalyses(limit: number): Promise<SEOAnalysis[]> {
    return Array.from(this.analyses.values())
      .slice(0, limit)
      .reverse(); // Latest first
  }
}

export const storage = new MemStorage();
