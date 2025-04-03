import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define all our response types for the SEO analyzer
export const seoAnalysisSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  description: z.string().optional(),
  tagCount: z.number(),
  score: z.number(),
  
  // Google search preview data
  titleTag: z.object({
    content: z.string().optional(),
    status: z.enum(["good", "warning", "error"]),
    feedback: z.string()
  }),
  
  descriptionTag: z.object({
    content: z.string().optional(),
    status: z.enum(["good", "warning", "error"]),
    feedback: z.string()
  }),
  
  // Open Graph data
  ogTags: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    url: z.string().optional(),
    type: z.string().optional(),
    status: z.enum(["good", "warning", "error"]),
    feedback: z.string()
  }),
  
  // Twitter Card data
  twitterTags: z.object({
    card: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    status: z.enum(["good", "warning", "error"]),
    feedback: z.string()
  }),
  
  // All analyzed SEO tags
  metaTags: z.array(z.object({
    type: z.string(),
    content: z.string().optional(),
    status: z.enum(["good", "warning", "error"]),
    recommendation: z.string()
  })),
  
  // Recommendations for improvement
  recommendations: z.array(z.object({
    title: z.string(),
    description: z.string(),
    status: z.enum(["good", "warning", "error"]),
    exampleCode: z.string().optional()
  }))
});

export type SEOAnalysis = z.infer<typeof seoAnalysisSchema>;
