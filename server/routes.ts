import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seoAnalysisSchema, type SEOAnalysis } from "@shared/schema";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Endpoint to analyze a URL
  app.post("/api/analyze", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const { url, force = false } = z.object({
        url: z.string().url(),
        force: z.boolean().optional().default(false)
      }).parse(req.body);
      
      // Check if we already have an analysis for this URL
      // Only use cached result if force=false
      if (!force) {
        const existingAnalysis = await storage.getAnalysisByUrl(url);
        if (existingAnalysis) {
          return res.json(existingAnalysis);
        }
      }
      
      // Fetch the HTML content
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEOMetaTagAnalyzer/1.0)'
        }
      });
      
      if (!response.ok) {
        return res.status(400).json({ 
          message: `Failed to fetch URL: ${response.status} ${response.statusText}` 
        });
      }
      
      const html = await response.text();
      
      // Parse the HTML and extract SEO tags
      const analysis = await analyzeSEO(url, html);
      
      // Save the analysis
      await storage.saveAnalysis(analysis);
      
      return res.json(analysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid URL provided", details: error.errors });
      }
      console.error("Error analyzing URL:", error);
      return res.status(500).json({ message: "Failed to analyze the URL" });
    }
  });
  
  // Endpoint to get recent analyses
  app.get("/api/recent", async (req: Request, res: Response) => {
    try {
      const limit = Number(req.query.limit) || 5;
      const analyses = await storage.getRecentAnalyses(limit);
      return res.json(analyses);
    } catch (error) {
      console.error("Error fetching recent analyses:", error);
      return res.status(500).json({ message: "Failed to fetch recent analyses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to analyze SEO tags from HTML
async function analyzeSEO(url: string, html: string): Promise<SEOAnalysis> {
  const $ = cheerio.load(html);
  
  // Extract and analyze title
  const title = $('title').text().trim();
  const titleLength = title.length;
  let titleStatus: "good" | "warning" | "error" = "good";
  let titleFeedback = "Great! Your title is an optimal length.";
  
  if (titleLength === 0) {
    titleStatus = "error";
    titleFeedback = "Missing title tag. Search engines use this as the main headline.";
  } else if (titleLength < 30) {
    titleStatus = "warning";
    titleFeedback = `Your title is too short at ${titleLength} characters (recommended 50-60 characters).`;
  } else if (titleLength > 60) {
    titleStatus = "warning";
    titleFeedback = `Your title is too long at ${titleLength} characters (recommended 50-60 characters).`;
  }
  
  // Extract and analyze description
  const description = $('meta[name="description"]').attr('content') || '';
  const descriptionLength = description.length;
  let descriptionStatus: "good" | "warning" | "error" = "good";
  let descriptionFeedback = "Great! Your description is an optimal length.";
  
  if (descriptionLength === 0) {
    descriptionStatus = "error";
    descriptionFeedback = "Missing meta description. This is important for search result snippets.";
  } else if (descriptionLength < 120) {
    descriptionStatus = "warning";
    descriptionFeedback = `Your description is too short at ${descriptionLength} characters (recommended 120-160 characters).`;
  } else if (descriptionLength > 160) {
    descriptionStatus = "warning";
    descriptionFeedback = `Your description is too long at ${descriptionLength} characters (recommended 120-160 characters).`;
  }
  
  // Extract Open Graph tags
  const ogTitle = $('meta[property="og:title"]').attr('content') || '';
  const ogDescription = $('meta[property="og:description"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  const ogUrl = $('meta[property="og:url"]').attr('content') || '';
  const ogType = $('meta[property="og:type"]').attr('content') || '';
  
  let ogStatus: "good" | "warning" | "error" = "good";
  let ogFeedback = "All essential Open Graph tags are present.";
  
  if (!ogTitle && !ogDescription && !ogImage) {
    ogStatus = "error";
    ogFeedback = "No Open Graph tags found. Adding these tags improves how your content appears when shared on social media.";
  } else if (!ogTitle || !ogDescription || !ogImage) {
    ogStatus = "warning";
    ogFeedback = "Some Open Graph tags are missing. Complete the set for better social sharing.";
  }
  
  // Extract Twitter Card tags
  const twitterCard = $('meta[name="twitter:card"]').attr('content') || '';
  const twitterTitle = $('meta[name="twitter:title"]').attr('content') || '';
  const twitterDescription = $('meta[name="twitter:description"]').attr('content') || '';
  const twitterImage = $('meta[name="twitter:image"]').attr('content') || '';
  
  let twitterStatus: "good" | "warning" | "error" = "good";
  let twitterFeedback = "All essential Twitter Card tags are present.";
  
  if (!twitterCard && !twitterTitle && !twitterDescription && !twitterImage) {
    twitterStatus = "error";
    twitterFeedback = "No Twitter Card tags found. These tags control how your content appears when shared on Twitter.";
  } else if (!twitterCard || !twitterTitle || !twitterDescription || !twitterImage) {
    twitterStatus = "warning";
    twitterFeedback = "Some Twitter Card tags are missing. Complete the set for better Twitter sharing.";
  }
  
  // Analyze additional meta tags
  const metaTags: Array<{
    type: string;
    content?: string;
    status: "good" | "warning" | "error";
    recommendation: string;
  }> = [];
  
  // Title tag
  metaTags.push({
    type: "Title",
    content: title,
    status: titleStatus,
    recommendation: titleFeedback
  });
  
  // Description tag
  metaTags.push({
    type: "Meta Description",
    content: description,
    status: descriptionStatus,
    recommendation: descriptionFeedback
  });
  
  // Check for keywords (not as important today, but still used)
  const keywords = $('meta[name="keywords"]').attr('content');
  metaTags.push({
    type: "Meta Keywords",
    content: keywords,
    status: keywords ? "warning" : "error",
    recommendation: "Not critical for rankings but can be added"
  });
  
  // Check for canonical URL
  const canonical = $('link[rel="canonical"]').attr('href');
  metaTags.push({
    type: "Canonical URL",
    content: canonical,
    status: canonical ? "good" : "error",
    recommendation: canonical ? "No change needed" : "Add a canonical URL to prevent duplicate content issues"
  });
  
  // Check for robots meta
  const robots = $('meta[name="robots"]').attr('content');
  metaTags.push({
    type: "Robots Meta",
    content: robots || "index, follow", // Default value if not specified
    status: robots ? "good" : "warning",
    recommendation: robots ? "No change needed" : "Consider adding robots meta tag for explicit crawl instructions"
  });
  
  // Check for viewport
  const viewport = $('meta[name="viewport"]').attr('content');
  metaTags.push({
    type: "Viewport",
    content: viewport,
    status: viewport ? "good" : "error",
    recommendation: viewport ? "No change needed" : "Add viewport meta tag for mobile responsiveness"
  });
  
  // Generate recommendations
  const recommendations: Array<{
    title: string;
    description: string;
    status: "good" | "warning" | "error";
    exampleCode?: string;
  }> = [];
  
  // OG recommendations
  if (ogStatus !== "good") {
    recommendations.push({
      title: "Add Open Graph Tags",
      description: "Open Graph metadata improves the way your content appears when shared on social platforms like Facebook, LinkedIn, and others.",
      status: "warning",
      exampleCode: `<meta property="og:title" content="Your Page Title" />
<meta property="og:description" content="Your page description..." />
<meta property="og:image" content="https://yourdomain.com/image.jpg" />
<meta property="og:url" content="https://yourdomain.com/page" />
<meta property="og:type" content="website" />`
    });
  }
  
  // Twitter recommendations
  if (twitterStatus !== "good") {
    recommendations.push({
      title: "Add Twitter Card Tags",
      description: "Twitter Card tags ensure your content looks great when shared on Twitter with rich images and properly formatted text.",
      status: "warning",
      exampleCode: `<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Your Page Title" />
<meta name="twitter:description" content="Your page description..." />
<meta name="twitter:image" content="https://yourdomain.com/image.jpg" />`
    });
  }
  
  // Canonical recommendations
  if (!canonical) {
    recommendations.push({
      title: "Add Canonical URL",
      description: "A canonical URL helps prevent duplicate content issues by specifying the preferred version of a page.",
      status: "warning",
      exampleCode: `<link rel="canonical" href="https://yourdomain.com/page" />`
    });
  }
  
  // Description length recommendation
  if (descriptionStatus === "warning" && descriptionLength < 120) {
    recommendations.push({
      title: "Meta Description Length",
      description: "Consider extending your meta description to between 120-160 characters to maximize visibility in search results.",
      status: "warning"
    });
  }
  
  // Count all meta tags
  const allMetaTags = $('meta').length;
  
  // Calculate overall score
  let score = 100;
  if (titleStatus === "warning") score -= 5;
  if (titleStatus === "error") score -= 15;
  if (descriptionStatus === "warning") score -= 5;
  if (descriptionStatus === "error") score -= 15;
  if (ogStatus === "warning") score -= 10;
  if (ogStatus === "error") score -= 15;
  if (twitterStatus === "warning") score -= 10;
  if (twitterStatus === "error") score -= 15;
  if (!canonical) score -= 10;
  if (!viewport) score -= 10;
  
  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));
  
  return {
    url,
    title,
    description,
    tagCount: allMetaTags,
    score,
    
    titleTag: {
      content: title,
      status: titleStatus,
      feedback: titleFeedback
    },
    
    descriptionTag: {
      content: description,
      status: descriptionStatus,
      feedback: descriptionFeedback
    },
    
    ogTags: {
      title: ogTitle,
      description: ogDescription,
      image: ogImage,
      url: ogUrl,
      type: ogType,
      status: ogStatus,
      feedback: ogFeedback
    },
    
    twitterTags: {
      card: twitterCard,
      title: twitterTitle,
      description: twitterDescription,
      image: twitterImage,
      status: twitterStatus,
      feedback: twitterFeedback
    },
    
    metaTags,
    recommendations
  };
}
