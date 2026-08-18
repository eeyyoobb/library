"use server";

import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { hash } from "bcryptjs";
import { signIn } from "@/auth";
import { headers } from "next/headers";
import ratelimit from "@/lib/ratelimit";
import { redirect } from "next/navigation";
import { workflowClient } from "@/lib/workflow";
import config from "@/lib/config";
import { validateTelegramInitData } from "@/lib/telegram";

export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">,
) => {
  const { email, password } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.log(error, "Signin error");
    return { success: false, error: "Signin error" };
  }
};

export const signUp = async (params: AuthCredentials) => {
  const { fullName, email, password } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: "User already exists" };
  }

  const hashedPassword = await hash(password, 10);

  try {
    await db.insert(users).values({
      fullName,
      email,
      password: hashedPassword,
    });

    await workflowClient.trigger({
      url: `${config.env.prodApiEndpoint}/api/workflows/onboarding`,
      body: {
        email,
        fullName,
      },
    });

    await signInWithCredentials({ email, password });

    return { success: true };
  } catch (error) {
    console.log(error, "Signup error");
    return { success: false, error: "Signup error" };
  }
};

export async function authenticateTelegramUser(initData: string) {
  try {
    // 1. Validate signature & extract Telegram user payload
    const telegramUser = await validateTelegramInitData(initData);
    if (!telegramUser?.id) {
      return { success: false, error: "Invalid Telegram payload" };
    }

    const telegramId = String(telegramUser.id);
    const fullName =
      [telegramUser.first_name, telegramUser.last_name]
        .filter(Boolean)
        .join(" ") || "Telegram User";

    // 2. Query Neon DB for existing user
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramId))
      .limit(1);

    let dbUser = existing[0];

    // 3. Save directly to Neon DB if first-time user
    if (!dbUser) {
      const [createdUser] = await db
        .insert(users)
        .values({
          fullName,
          telegramId,
          telegramUsername: telegramUser.username ?? null,
          status: "PENDING",
          role: "USER",
        })
        .returning();

      dbUser = createdUser;
    } else {
      // Update profile info on subsequent logins
      await db
        .update(users)
        .set({
          fullName,
          telegramUsername: telegramUser.username ?? null,
        })
        .where(eq(users.id, dbUser.id));
    }

    // 4. Authenticate session using credentials provider
    await signIn("telegram", {
      initData,
      redirect: false,
    });

    return { success: true, userId: dbUser.id };
  } catch (error) {
    console.error("[Telegram Direct Auth Error]:", error);
    return { success: false, error: "Authentication failed" };
  }
}
