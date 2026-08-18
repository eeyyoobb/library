"use client";

import { authenticateTelegramUser } from "@/lib/telegram";
import { useEffect, useState } from "react";

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

export default function TelegramAuth() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTelegramEnv, setIsTelegramEnv] = useState(false);

  useEffect(() => {
    const initTelegram = async () => {
      if (typeof window === "undefined") return;

      const WebApp = (await import("@twa-dev/sdk")).default;
      WebApp.ready();

      const user = WebApp.initDataUnsafe?.user as UserData | undefined;

      if (user) {
        setIsTelegramEnv(true);
        setUserData(user);

        // Authenticate/Sync with Neon DB
        const result = await authenticateTelegramUser(user);
        if (!result.success) {
          console.error("Failed to sync Telegram user with database.");
        }
      }
      setLoading(false);
    };

    initTelegram();
  }, []);

  // Do not render anything if opened outside Telegram
  if (!isTelegramEnv) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 text-white">
      <div className="rounded-lg bg-zinc-900 p-6 text-center">
        {loading ? (
          <p className="animate-pulse text-sm">
            Authenticating with Telegram...
          </p>
        ) : userData ? (
          <>
            <h1 className="mb-4 text-2xl font-bold">
              Welcome, {userData.first_name}
            </h1>
            <p className="text-sm text-zinc-400">Signed in via Telegram</p>
          </>
        ) : (
          <p className="text-sm text-red-400">
            Failed to load Telegram user data.
          </p>
        )}
      </div>
    </div>
  );
}
