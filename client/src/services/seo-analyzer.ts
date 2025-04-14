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
    const response = await apiRequest('POST', '/api/analyze', { url, force });
    return await response.json();
  },

  /**
   * Get recent analyses
   * @param limit Number of recent analyses to retrieve
   * @returns List of recent analyses
   */
  async getRecentAnalyses(limit: number = 5): Promise<AnalysisResult[]> {
    const response = await apiRequest('GET', `/api/recent?limit=${limit}`);
    return await response.json();
  }
};
