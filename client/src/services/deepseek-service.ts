import { AnalysisResult, AIRecommendationsResponse } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

/**
 * Service to interact with the DeepSeek AI API for generating
 * intelligent SEO recommendations based on analysis results
 */
export const DeepSeekService = {
  /**
   * Generates AI recommendations based on the analysis result
   * @param result The SEO analysis result
   * @returns Array of AI-generated recommendations
   */
  async generateRecommendations(result: AnalysisResult): Promise<AIRecommendationsResponse> {
    try {
      const response = await apiRequest<AIRecommendationsResponse>('/api/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysisResult: result })
      });
      
      return response;
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      throw new Error("Failed to generate AI recommendations");
    }
  }
};

/**
 * Helper function to convert an analysis result to markdown format
 * This can be used for display purposes or for sending to the AI
 * @param result The SEO analysis result
 * @returns Markdown formatted string representing the analysis
 */
export function analysisToMarkdown(result: AnalysisResult): string {
  let markdown = `# SEO Analysis for ${result.url}\n\n`;
  
  // Add overall score
  markdown += `## Overall Score: ${result.score}%\n\n`;
  
  // Add title and description info
  markdown += "## Basic SEO Elements\n\n";
  markdown += `### Title: ${result.titleTag.status}\n`;
  markdown += `${result.titleTag.content || 'No title found'}\n`;
  markdown += `Feedback: ${result.titleTag.feedback}\n\n`;
  
  markdown += `### Description: ${result.descriptionTag.status}\n`;
  markdown += `${result.descriptionTag.content || 'No description found'}\n`;
  markdown += `Feedback: ${result.descriptionTag.feedback}\n\n`;
  
  // Add mobile friendliness data
  markdown += "## Mobile Friendliness\n\n";
  markdown += `Score: ${result.mobileFriendliness.score}%\n`;
  markdown += `Status: ${result.mobileFriendliness.status}\n`;
  markdown += `Feedback: ${result.mobileFriendliness.feedback}\n\n`;
  markdown += "| Feature | Status |\n| --- | --- |\n";
  markdown += `| Viewport | ${result.mobileFriendliness.viewport ? '✅' : '❌'} |\n`;
  markdown += `| Responsive Design | ${result.mobileFriendliness.responsiveDesign ? '✅' : '❌'} |\n`;
  markdown += `| Touch Elements | ${result.mobileFriendliness.touchElements ? '✅' : '❌'} |\n`;
  markdown += `| Font Readability | ${result.mobileFriendliness.fontReadability ? '✅' : '❌'} |\n`;
  markdown += `| Media Queries | ${result.mobileFriendliness.mediaQueries ? '✅' : '❌'} |\n\n`;
  
  // Add page speed info
  markdown += "## Page Speed\n\n";
  markdown += `Load Time: ${result.pageSpeed.loadTime}ms\n`;
  markdown += `Resource Size: ${result.pageSpeed.resourceSize ? result.pageSpeed.resourceSize.toFixed(2) + 'KB' : 'Unknown'}\n`;
  markdown += `Status: ${result.pageSpeed.status}\n`;
  markdown += `Feedback: ${result.pageSpeed.feedback}\n\n`;
  
  // Add social media tags
  markdown += "## Social Media Integration\n\n";
  
  markdown += "### Open Graph\n";
  markdown += `Status: ${result.ogTags.status}\n`;
  if (result.ogTags.title || result.ogTags.description || result.ogTags.image) {
    markdown += "Found tags:\n";
    if (result.ogTags.title) markdown += `- og:title: ${result.ogTags.title}\n`;
    if (result.ogTags.description) markdown += `- og:description: ${result.ogTags.description}\n`;
    if (result.ogTags.image) markdown += `- og:image: ${result.ogTags.image}\n`;
    if (result.ogTags.url) markdown += `- og:url: ${result.ogTags.url}\n`;
    if (result.ogTags.type) markdown += `- og:type: ${result.ogTags.type}\n`;
  } else {
    markdown += "No Open Graph tags found\n";
  }
  markdown += `\n`;
  
  markdown += "### Twitter Card\n";
  markdown += `Status: ${result.twitterTags.status}\n`;
  if (result.twitterTags.title || result.twitterTags.description || result.twitterTags.image) {
    markdown += "Found tags:\n";
    if (result.twitterTags.card) markdown += `- twitter:card: ${result.twitterTags.card}\n`;
    if (result.twitterTags.title) markdown += `- twitter:title: ${result.twitterTags.title}\n`;
    if (result.twitterTags.description) markdown += `- twitter:description: ${result.twitterTags.description}\n`;
    if (result.twitterTags.image) markdown += `- twitter:image: ${result.twitterTags.image}\n`;
  } else {
    markdown += "No Twitter Card tags found\n";
  }
  markdown += `\n`;
  
  // Add meta tags summary
  markdown += "## Meta Tags Summary\n\n";
  markdown += "| Tag | Status | Content | Recommendation |\n";
  markdown += "| --- | --- | --- | --- |\n";
  
  result.metaTags.forEach(tag => {
    const status = tag.status === 'good' ? '✅' : tag.status === 'warning' ? '⚠️' : '❌';
    markdown += `| ${tag.type} | ${status} | ${tag.content || 'N/A'} | ${tag.recommendation} |\n`;
  });
  
  markdown += "\n## Current Recommendations\n\n";
  
  if (result.recommendations.length === 0) {
    markdown += "No recommendations - website appears to be well optimized\n";
  } else {
    result.recommendations.forEach((rec, index) => {
      const status = rec.status === 'good' ? '✅' : rec.status === 'warning' ? '⚠️' : '❌';
      markdown += `### ${index + 1}. ${rec.title} ${status}\n`;
      markdown += `${rec.description}\n\n`;
      if (rec.exampleCode) {
        markdown += "```html\n";
        markdown += rec.exampleCode + "\n";
        markdown += "```\n\n";
      }
    });
  }
  
  return markdown;
}