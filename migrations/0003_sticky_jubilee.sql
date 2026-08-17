ALTER TABLE "books" ALTER COLUMN "genre" SET DEFAULT 'spiritual';--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "rating" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "cover_color" SET DEFAULT '#000000';--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "summary" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "category" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "subcategory" varchar(100);--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "language" varchar(20) DEFAULT 'am' NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "translated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "translator" varchar(255);--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "keywords" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "topics" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "audience" varchar(50) DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "tradition" varchar(50) DEFAULT 'christian' NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "package_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "uploader" text NOT NULL;--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN "total_copies";--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN "available_copies";