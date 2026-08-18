"use server";

import { signIn } from "@/auth";
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
        role: "USER",
      })
      .returning();

    await signIn("telegram", {
      telegramId: telegramUser.id.toString(),
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name || "",
      username: telegramUser.username || "",
      redirect: false,
    });

    return { success: true, user: newUser, isNewUser: true };
  } catch (error) {
    console.error("[TELEGRAM_AUTH_ERROR]", error);
    return { success: false, message: "Authentication failed." };
  }
}

// lib/is-telegram.ts

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        platform?: string;
        initDataUnsafe?: {
          user?: unknown;
        };
      };
    };
  }
}

export function checkIsTelegram(): boolean {
  if (typeof window === "undefined") return false;

  // 1. Development mode override
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // 2. Direct WebApp object check
  const webApp = window.Telegram?.WebApp;
  if (webApp?.initData || (webApp?.platform && webApp.platform !== "unknown")) {
    return true;
  }

  // 3. Telegram WebApp URL hash detection (fallback for slow SDK loads)
  if (window.location.hash.includes("tgWebAppData=")) {
    return true;
  }

  return false;
}
