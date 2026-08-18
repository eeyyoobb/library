ALTER TABLE "users" DROP CONSTRAINT "users_university_id_unique";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "telegram_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "telegram_username" varchar(255);--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "university_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "university_card";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id");