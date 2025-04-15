import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User authentication table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  password: true,
});

// For validation during sign-up
export const registerUserSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// For validation during login
export const loginUserSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Sessions table for auth persistence
export const sessions = pgTable("sessions", {
  sid: varchar("sid", { length: 255 }).primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { withTimezone: true }).notNull(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// SEO Analyses table for database persistence
export const seoAnalyses = pgTable("seo_analyses", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  analyzed_at: timestamp("analyzed_at").defaultNow().notNull(),
  data: jsonb("data").notNull(), // Store the entire analysis as JSON
});

export const insertSEOAnalysisSchema = createInsertSchema(seoAnalyses).pick({
  url: true,
  data: true,
});

export type InsertSEOAnalysis = z.infer<typeof insertSEOAnalysisSchema>;
export type SEOAnalysisRecord = typeof seoAnalyses.$inferSelect;

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
  
  // Page Speed metrics
  pageSpeed: z.object({
    loadTime: z.number(),
    resourceSize: z.number().optional(), // in KB
    requestCount: z.number().optional(),
    status: z.enum(["good", "warning", "error"]),
    feedback: z.string()
  }),
  
  // Mobile-friendliness data
  mobileFriendliness: z.object({
    score: z.number(),
    status: z.enum(["good", "warning", "error"]),
    viewport: z.boolean(),
    responsiveDesign: z.boolean(),
    touchElements: z.boolean(),
    fontReadability: z.boolean(),
    mediaQueries: z.boolean(),
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
