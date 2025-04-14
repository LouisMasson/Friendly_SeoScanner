import { jsPDF } from "jspdf";
import { AnalysisResult, SEOStatusType } from "@/lib/types";
import { getStatusColor, truncateString } from "@/lib/utils";

/**
 * Generate a PDF report from SEO analysis data
 * @param result The SEO analysis result
 * @returns The generated PDF document
 */
export function generateSEOReport(result: AnalysisResult): jsPDF {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15; // margin in mm
  const contentWidth = pageWidth - (margin * 2);
  
  // Add title and header
  doc.setFontSize(22);
  doc.setTextColor(20, 20, 20);
  doc.text("SEO Analysis Report", margin, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const dateText = `Generated on ${new Date().toLocaleDateString()}`;
  doc.text(dateText, margin, 28);

  // URL and basic info
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("URL Analyzed:", margin, 40);
  
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text(result.url, margin, 48);
  
  // Score section
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Overall SEO Score:", margin, 60);
  
  doc.setFontSize(22);
  const scoreColor = getScoreColor(result.score);
  doc.setTextColor(hexToRgb(scoreColor).r, hexToRgb(scoreColor).g, hexToRgb(scoreColor).b);
  doc.text(`${result.score}/100`, margin, 70);
  
  // Title and description section
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Title & Description Analysis", margin, 85);
  
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text("Title:", margin, 95);
  doc.text(truncateString(result.titleTag.content || "Not found", 70), margin + 25, 95);
  
  doc.text("Status:", margin, 102);
  const titleStatusColor = getStatusColorHex(result.titleTag.status);
  doc.setTextColor(hexToRgb(titleStatusColor).r, hexToRgb(titleStatusColor).g, hexToRgb(titleStatusColor).b);
  doc.text(capitalizeFirstLetter(result.titleTag.status), margin + 25, 102);
  
  doc.setTextColor(50, 50, 50);
  doc.text("Feedback:", margin, 109);
  
  // Wrap feedback text
  const titleFeedback = result.titleTag.feedback;
  const wrappedTitleFeedback = doc.splitTextToSize(titleFeedback, contentWidth - 30);
  doc.text(wrappedTitleFeedback, margin + 25, 109);

  // Description - add more spacing
  let currentY = 109 + (wrappedTitleFeedback.length * 7) + 5;
  
  doc.setTextColor(50, 50, 50);
  doc.text("Description:", margin, currentY);
  
  const description = truncateString(result.descriptionTag.content || "Not found", 100);
  const wrappedDescription = doc.splitTextToSize(description, contentWidth - 30);
  doc.text(wrappedDescription, margin + 25, currentY);
  
  currentY += (wrappedDescription.length * 7) + 5;
  
  doc.text("Status:", margin, currentY);
  const descStatusColor = getStatusColorHex(result.descriptionTag.status);
  doc.setTextColor(hexToRgb(descStatusColor).r, hexToRgb(descStatusColor).g, hexToRgb(descStatusColor).b);
  doc.text(capitalizeFirstLetter(result.descriptionTag.status), margin + 25, currentY);
  
  currentY += 7;
  
  doc.setTextColor(50, 50, 50);
  doc.text("Feedback:", margin, currentY);
  
  const descFeedback = result.descriptionTag.feedback;
  const wrappedDescFeedback = doc.splitTextToSize(descFeedback, contentWidth - 30);
  doc.text(wrappedDescFeedback, margin + 25, currentY);
  
  currentY += (wrappedDescFeedback.length * 7) + 5;
  
  // Social media tags
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Social Media Optimization", margin, currentY);
  
  currentY += 10;
  
  // Open Graph
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text("Open Graph:", margin, currentY);
  
  const ogStatusColor = getStatusColorHex(result.ogTags.status);
  doc.setTextColor(hexToRgb(ogStatusColor).r, hexToRgb(ogStatusColor).g, hexToRgb(ogStatusColor).b);
  doc.text(capitalizeFirstLetter(result.ogTags.status), margin + 25, currentY);
  
  currentY += 7;
  
  doc.setTextColor(50, 50, 50);
  doc.text("Feedback:", margin, currentY);
  
  const ogFeedback = result.ogTags.feedback;
  const wrappedOgFeedback = doc.splitTextToSize(ogFeedback, contentWidth - 30);
  doc.text(wrappedOgFeedback, margin + 25, currentY);
  
  currentY += (wrappedOgFeedback.length * 7) + 5;
  
  // Twitter Cards
  doc.setTextColor(50, 50, 50);
  doc.text("Twitter Cards:", margin, currentY);
  
  const twitterStatusColor = getStatusColorHex(result.twitterTags.status);
  doc.setTextColor(hexToRgb(twitterStatusColor).r, hexToRgb(twitterStatusColor).g, hexToRgb(twitterStatusColor).b);
  doc.text(capitalizeFirstLetter(result.twitterTags.status), margin + 25, currentY);
  
  currentY += 7;
  
  doc.setTextColor(50, 50, 50);
  doc.text("Feedback:", margin, currentY);
  
  const twitterFeedback = result.twitterTags.feedback;
  const wrappedTwitterFeedback = doc.splitTextToSize(twitterFeedback, contentWidth - 30);
  doc.text(wrappedTwitterFeedback, margin + 25, currentY);
  
  currentY += (wrappedTwitterFeedback.length * 7) + 10;
  
  // Top Recommendations
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Top Recommendations", margin, currentY);
  
  currentY += 10;
  
  // Add some key recommendations (up to 3)
  const topRecommendations = result.recommendations
    .filter(rec => rec.status !== "good")
    .slice(0, 3);
  
  if (topRecommendations.length > 0) {
    topRecommendations.forEach((rec, index) => {
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      doc.text(`${index + 1}. ${rec.title}`, margin, currentY);
      
      currentY += 7;
      
      const recDesc = doc.splitTextToSize(rec.description, contentWidth - 15);
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(10);
      doc.text(recDesc, margin + 5, currentY);
      
      currentY += (recDesc.length * 6) + 8;
    });
  } else {
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text("No critical recommendations found. Great job!", margin, currentY);
  }
  
  // Add footer
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("SEO Meta Tag Analyzer | Generated with 💻", margin, footerY);
  
  // Return the document
  return doc;
}

// Helper functions
function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e"; // green
  if (score >= 50) return "#eab308"; // yellow
  return "#ef4444"; // red
}

function getStatusColorHex(status: SEOStatusType): string {
  switch (status) {
    case "good": return "#22c55e";
    case "warning": return "#eab308";
    case "error": return "#ef4444";
    default: return "#a1a1aa";
  }
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function hexToRgb(hex: string): { r: number, g: number, b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}