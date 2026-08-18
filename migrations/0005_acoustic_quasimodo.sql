ALTER TABLE "users" ALTER COLUMN "telegram_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "university_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "university_card" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_university_id_unique" UNIQUE("university_id");