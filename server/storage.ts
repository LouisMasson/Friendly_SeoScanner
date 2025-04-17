import { seoAnalysisSchema, type SEOAnalysis, seoAnalyses } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  saveAnalysis(analysis: SEOAnalysis, userId?: number): Promise<SEOAnalysis>;
  getAnalysisByUrl(url: string): Promise<SEOAnalysis | undefined>;
  getRecentAnalyses(limit: number, userId?: number): Promise<SEOAnalysis[]>;
  getUserAnalyses(userId: number, limit?: number): Promise<SEOAnalysis[]>;
}

// In-memory implementation (kept as a fallback)
export class MemStorage implements IStorage {
  private analyses: Map<string, { analysis: SEOAnalysis, userId?: number }>;

  constructor() {
    this.analyses = new Map();
  }

  async saveAnalysis(analysis: SEOAnalysis, userId?: number): Promise<SEOAnalysis> {
    this.analyses.set(analysis.url, { analysis, userId });
    return analysis;
  }

  async getAnalysisByUrl(url: string): Promise<SEOAnalysis | undefined> {
    const entry = this.analyses.get(url);
    return entry ? entry.analysis : undefined;
  }

  async getRecentAnalyses(limit: number, userId?: number): Promise<SEOAnalysis[]> {
    const values = Array.from(this.analyses.values());
    
    // Filter by userId if provided
    const filtered = userId 
      ? values.filter(entry => entry.userId === userId)
      : values;
    
    return filtered
      .map(entry => entry.analysis)
      .slice(0, limit)
      .reverse(); // Latest first
  }
  
  async getUserAnalyses(userId: number, limit: number = 10): Promise<SEOAnalysis[]> {
    return this.getRecentAnalyses(limit, userId);
  }
}

// PostgreSQL database implementation
export class DbStorage implements IStorage {
  async saveAnalysis(analysis: SEOAnalysis, userId?: number): Promise<SEOAnalysis> {
    try {
      // Check if analysis for this URL already exists
      const existing = await this.getAnalysisByUrl(analysis.url);
      
      if (existing) {
        // Update existing analysis
        await db.update(seoAnalyses)
          .set({ 
            data: analysis as any, 
            analyzed_at: new Date(),
            userId: userId || null
          })
          .where(eq(seoAnalyses.url, analysis.url))
          .execute();
      } else {
        // Insert new analysis
        await db.insert(seoAnalyses)
          .values({
            url: analysis.url,
            data: analysis as any,
            analyzed_at: new Date(),
            userId: userId || null
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

  async getRecentAnalyses(limit: number, userId?: number): Promise<SEOAnalysis[]> {
    try {
      let query = db.select().from(seoAnalyses);
      
      // Filter by userId if provided
      if (userId) {
        query = query.where(eq(seoAnalyses.userId, userId));
      }
      
      const results = await query
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
  
  async getUserAnalyses(userId: number, limit: number = 10): Promise<SEOAnalysis[]> {
    try {
      const results = await db.select()
        .from(seoAnalyses)
        .where(eq(seoAnalyses.userId, userId))
        .orderBy(desc(seoAnalyses.analyzed_at))
        .limit(limit)
        .execute();
      
      // Map to SEOAnalysis objects
      return results.map(record => record.data as unknown as SEOAnalysis);
    } catch (error) {
      console.error("Error fetching user analyses from database:", error);
      return [];
    }
  }
}

// Create database storage instance
export const storage = new DbStorage();
