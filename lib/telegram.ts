"use server";

import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

interface TelegramUserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

export async function authenticateTelegramUser(telegramUser: TelegramUserData) {
  try {
    const telegramId = telegramUser.id.toString();
    const email = `${telegramUser.username || `tg_${telegramId}`}@telegram.user`;
    const fullName = [telegramUser.first_name, telegramUser.last_name]
      .filter(Boolean)
      .join(" ");

    // 1. Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramId))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: true, user: existingUser[0], isNewUser: false };
    }

    // 2. Create new user if not found
    const [newUser] = await db
      .insert(users)
      .values({
        telegramId: telegramId,
        fullName: fullName,
        email: email,
        // Set default role/fields as needed by your schema
        role: "USER",
      })
      .returning();

    return { success: true, user: newUser, isNewUser: true };
  } catch (error) {
    console.error("[TELEGRAM_AUTH_ERROR]", error);
    return { success: false, message: "Authentication failed." };
  }
}
