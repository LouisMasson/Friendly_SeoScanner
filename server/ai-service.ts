import { SEOAnalysis } from "../shared/schema";
import { RecommendationEntry } from "@shared/types";
import fetch from "node-fetch";

/**
 * AI service for generating recommendations using DeepSeek API
 */
export const aiService = {
  /**
   * Convert an analysis to markdown format for AI prompt
   * @param analysis SEO analysis result
   * @returns Markdown string representation of the analysis
   */
  analysisToMarkdown(analysis: SEOAnalysis): string {
    // This is a simplified version - we have a more comprehensive version on the client side
    let markdown = `# SEO Analysis for ${analysis.url}\n\n`;
    
    // Add overall score
    markdown += `## Overall Score: ${analysis.score}%\n\n`;
    
    // Add title and description info
    markdown += `## Title: ${analysis.titleTag.status}\n`;
    markdown += `${analysis.titleTag.content || 'No title found'}\n`;
    markdown += `Feedback: ${analysis.titleTag.feedback}\n\n`;
    
    markdown += `## Description: ${analysis.descriptionTag.status}\n`;
    markdown += `${analysis.descriptionTag.content || 'No description found'}\n`;
    markdown += `Feedback: ${analysis.descriptionTag.feedback}\n\n`;
    
    return markdown;
  },

  /**
   * Generate AI recommendations using DeepSeek API
   * @param analysis The SEO analysis to generate recommendations for
   * @returns Object containing recommendations and summary text
   */
  async generateRecommendations(analysis: SEOAnalysis): Promise<{
    recommendations: RecommendationEntry[],
    summaryText: string
  }> {
    try {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      
      if (!apiKey) {
        throw new Error("DeepSeek API key not found");
      }
      
      // Convert analysis to markdown for the AI prompt
      const markdown = this.analysisToMarkdown(analysis);
      
      // Create prompt for DeepSeek
      const prompt = `
You are an expert SEO consultant analyzing website data. Below is an SEO analysis for a website.
Based on this data, provide 3-5 additional specific, actionable recommendations to improve the website's SEO that aren't already mentioned in the existing recommendations.

Format your response in JSON with the following structure:
{
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed explanation of the recommendation",
      "status": "warning",
      "exampleCode": "Example code if applicable (optional)"
    }
  ],
  "summaryText": "A brief 2-3 sentence summary of the overall SEO status and your key recommendations"
}

For the status field, use "good" for positive recommendations, "warning" for moderate issues, or "error" for critical issues.
Make sure each recommendation is specific, actionable, and directly relevant to the website being analyzed.

Here's the SEO analysis:

${markdown}
`;

      // Make request to DeepSeek API
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are an expert SEO consultant who provides specific, actionable advice for website optimization."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepSeek API error:", errorText);
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json() as any;
      
      // Extract the JSON response from the AI
      const aiResponseText = data.choices[0].message.content;
      let aiResponse: any;
      
      try {
        // Parse the JSON from the AI response
        aiResponse = JSON.parse(aiResponseText);
      } catch (error) {
        console.error("Failed to parse AI response:", error);
        console.log("Raw AI response:", aiResponseText);
        
        // Attempt to create a fallback response
        return {
          recommendations: [
            {
              title: "Error Generating AI Recommendations",
              description: "The AI service encountered an error processing this request. Please try again later.",
              status: "error"
            }
          ],
          summaryText: "AI recommendation service is currently unavailable. Please try again later."
        };
      }
      
      // Process and validate the AI response
      const validatedRecommendations = (aiResponse.recommendations || []).map((rec: any) => ({
        title: rec.title || "Recommendation",
        description: rec.description || "No details provided",
        status: ["good", "warning", "error"].includes(rec.status) ? rec.status : "warning",
        exampleCode: rec.exampleCode || undefined
      }));
      
      return {
        recommendations: validatedRecommendations,
        summaryText: aiResponse.summaryText || "AI analysis complete."
      };
      
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      throw new Error("Failed to generate AI recommendations");
    }
  }
};