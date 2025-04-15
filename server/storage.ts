import { seoAnalysisSchema, type SEOAnalysis, seoAnalyses } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  saveAnalysis(analysis: SEOAnalysis): Promise<SEOAnalysis>;
  getAnalysisByUrl(url: string): Promise<SEOAnalysis | undefined>;
  getRecentAnalyses(limit: number): Promise<SEOAnalysis[]>;
}

// In-memory implementation (kept as a fallback)
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

// PostgreSQL database implementation
export class DbStorage implements IStorage {
  async saveAnalysis(analysis: SEOAnalysis): Promise<SEOAnalysis> {
    try {
      // Check if analysis for this URL already exists
      const existing = await this.getAnalysisByUrl(analysis.url);
      
      if (existing) {
        // Update existing analysis
        await db.update(seoAnalyses)
          .set({ 
            data: analysis as any, 
            analyzed_at: new Date() 
          })
          .where(eq(seoAnalyses.url, analysis.url))
          .execute();
      } else {
        // Insert new analysis
        await db.insert(seoAnalyses)
          .values({
            url: analysis.url,
            data: analysis as any,
            analyzed_at: new Date()
          })
          .execute();
      }
      
      return analysis;
    } catch (error) {
      console.error("Error saving analysis to database:", error);
      throw error;
    }
  }

  async getAnalysisByUrl(url: string): Promise<SEOAnalysis | undefined> {
    try {
      const results = await db.select()
        .from(seoAnalyses)
        .where(eq(seoAnalyses.url, url))
        .execute();
      
      if (results.length === 0) {
        return undefined;
      }
      
      // Return the data field which contains the full SEO analysis
      return results[0].data as unknown as SEOAnalysis;
    } catch (error) {
      console.error("Error fetching analysis from database:", error);
      return undefined;
    }
  }

  async getRecentAnalyses(limit: number): Promise<SEOAnalysis[]> {
    try {
      const results = await db.select()
        .from(seoAnalyses)
        .orderBy(desc(seoAnalyses.analyzed_at))
        .limit(limit)
        .execute();
      
      // Map to SEOAnalysis objects
      return results.map(record => record.data as unknown as SEOAnalysis);
    } catch (error) {
      console.error("Error fetching recent analyses from database:", error);
      return [];
    }
  }
}

// Create database storage instance
export const storage = new DbStorage();
