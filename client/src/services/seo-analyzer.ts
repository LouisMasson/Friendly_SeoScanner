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
   * @param userOnly Whether to only get the current user's analyses
   * @returns List of recent analyses
   */
  async getRecentAnalyses(limit: number = 5, userOnly: boolean = false): Promise<AnalysisResult[]> {
    return await apiRequest<AnalysisResult[]>(`/api/recent?limit=${limit}&user=${userOnly}`);
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
  },
  
  /**
   * Get user's analysis history
   * @param limit Maximum number of analyses to retrieve
   * @returns List of the user's previous analyses
   */
  async getUserAnalyses(limit: number = 10): Promise<AnalysisResult[]> {
    try {
      return await apiRequest<AnalysisResult[]>(`/api/user/analyses?limit=${limit}`);
    } catch (error) {
      console.error("Error fetching user analyses:", error);
      // Return empty array if unauthorized or other error
      return [];
    }
  }
};
