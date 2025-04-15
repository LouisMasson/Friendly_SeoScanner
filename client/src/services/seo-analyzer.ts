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
  },

  /**
   * Get analysis for a specific URL
   * @param url The URL for which to retrieve the analysis
   * @returns Analysis result or null if not found
   */
  async getAnalysisByUrl(url: string): Promise<AnalysisResult | null> {
    try {
      const encodedUrl = encodeURIComponent(url);
      const response = await apiRequest('GET', `/api/analysis?url=${encodedUrl}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch analysis: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching analysis by URL:", error);
      return null;
    }
  }
};
