"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import WebApp from "@twa-dev/sdk";

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export default function TelegramAuth() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function authenticate() {
      try {
        /*
         * Initialize Telegram Mini App
         */
        WebApp.ready();
        WebApp.expand();

        /*
         * Check whether Telegram actually provided
         * authentication data.
         */
        const initData = WebApp.initData;

        if (!initData) {
          // Normal browser / not running as Mini App
          setChecking(false);
          return;
        }

        /*
         * This is safe for DISPLAYING the user.
         *
         * Do NOT use this as authentication proof.
         */
        const telegramUser = WebApp.initDataUnsafe?.user;

        if (telegramUser) {
          setUserData(telegramUser as UserData);
        }

        console.log("[TelegramAuth] Telegram Mini App detected");

        /*
         * Send the signed initData to NextAuth.
         *
         * The server validates it using TELEGRAM_BOT_TOKEN.
         */
        const result = await signIn("telegram", {
          initData,
          redirect: false,
        });

        if (result?.ok) {
          console.log("[TelegramAuth] Login successful");

          router.refresh();

          return;
        }

        console.error("[TelegramAuth] Login failed:", result?.error);
      } catch (error) {
        console.error("[TelegramAuth] Error:", error);
      } finally {
        setChecking(false);
      }
    }

    authenticate();
  }, [router]);

  /*
   * Normal browser:
   * Telegram doesn't exist, so this component
   * disappears and your normal page continues.
   */
  if (!checking) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="min-w-[280px] rounded-xl bg-black p-6 text-white shadow-xl">
        {userData ? (
          <>
            <h1 className="mb-4 text-xl font-bold">Telegram Login</h1>

            <div className="space-y-1 text-sm">
              <p>ID: {userData.id}</p>

              <p>First Name: {userData.first_name}</p>

              <p>Last Name: {userData.last_name || "N/A"}</p>

              <p>Username: {userData.username || "N/A"}</p>

              <p>Language: {userData.language_code}</p>

              <p>Premium: {userData.is_premium ? "Yes" : "No"}</p>
            </div>

            <p className="mt-5 text-center text-sm text-white/60">
              Signing in...
            </p>
          </>
        ) : (
          <p>Connecting to Telegram...</p>
        )}
      </div>
    </div>
  );
}
