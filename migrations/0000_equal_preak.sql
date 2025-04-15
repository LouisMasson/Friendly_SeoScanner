CREATE TABLE "seo_analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"analyzed_at" timestamp DEFAULT now() NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
