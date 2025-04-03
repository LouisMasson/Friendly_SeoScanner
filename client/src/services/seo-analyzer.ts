import { apiRequest } from "@/lib/queryClient";
import { AnalysisResult } from "@/lib/types";

/**
 * Service to handle SEO analysis operations
 */
export const SEOAnalyzerService = {
  /**
   * Analyze a website URL
   * @param url The URL to analyze
   * @returns Analysis result
   */
  async analyzeUrl(url: string): Promise<AnalysisResult> {
    const response = await apiRequest('POST', '/api/analyze', { url });
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
