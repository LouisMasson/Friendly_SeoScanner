import { apiRequest } from "@/lib/queryClient";
import { AnalysisResult } from "@/lib/types";

/**
 * Service to handle SEO analysis operations
 */
export const SEOAnalyzerService = {
  /**
   * Analyze a website URL
   * @param url The URL to analyze
   * @param force Whether to force a fresh analysis, bypassing cache
   * @returns Analysis result
   */
  async analyzeUrl(url: string, force: boolean = true): Promise<AnalysisResult> {
    return await apiRequest<AnalysisResult>('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, force })
    });
  },

  /**
   * Get recent analyses
   * @param limit Number of recent analyses to retrieve
   * @returns List of recent analyses
   */
  async getRecentAnalyses(limit: number = 5): Promise<AnalysisResult[]> {
    return await apiRequest<AnalysisResult[]>(`/api/recent?limit=${limit}`);
  },

  /**
   * Get analysis for a specific URL
   * @param url The URL for which to retrieve the analysis
   * @returns Analysis result or null if not found
   */
  async getAnalysisByUrl(url: string): Promise<AnalysisResult | null> {
    try {
      const encodedUrl = encodeURIComponent(url);
      return await apiRequest<AnalysisResult>(`/api/analysis?url=${encodedUrl}`);
    } catch (error) {
      console.error("Error fetching analysis by URL:", error);
      return null;
    }
  }
};
