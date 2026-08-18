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

interface TelegramAuthProps {
  onAuthenticated?: (user: unknown) => void;
}

// Mock Telegram user for local development
// const MOCK_TELEGRAM_USER: UserData = {
//   id: 999999999,
//   first_name: "Dev",
//   last_name: "User",
//   username: "dev_tester",
//   language_code: "en",
//   is_premium: true,
// };

export default function TelegramAuth({ onAuthenticated }: TelegramAuthProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTelegramEnv, setIsTelegramEnv] = useState(false);
  const [showToast, setShowToast] = useState(true);

  useEffect(() => {
    const initTelegram = async () => {
      if (typeof window === "undefined") return;

      let user: UserData | undefined;

      // 1. Check for local development environment
      // if (process.env.NODE_ENV === "development") {
      //   setIsTelegramEnv(true);
      //   user = MOCK_TELEGRAM_USER;
      // } else {
      // 2. Production: Use actual Telegram WebApp SDK
      const WebApp = (await import("@twa-dev/sdk")).default;
      WebApp.ready();
      user = WebApp.initDataUnsafe?.user as UserData | undefined;
      if (user) setIsTelegramEnv(true);
      // }

      if (user) {
        setUserData(user);

        const result = await authenticateTelegramUser(user);
        if (result.success) {
          onAuthenticated?.(result.user);
          setTimeout(() => setShowToast(false), 3000);
        } else {
          console.error("Failed to sync Telegram user with database.");
        }
      }

      setLoading(false);
    };

    initTelegram();
  }, [onAuthenticated]);

  if (!isTelegramEnv || !showToast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg bg-zinc-900 p-4 shadow-lg border border-zinc-800 text-white transition-all">
      {loading ? (
        <p className="animate-pulse text-xs text-zinc-400">
          Authenticating with Telegram...
        </p>
      ) : userData ? (
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">
              Welcome, {userData.first_name}
            </p>
            <p className="text-xs text-zinc-400">
              Signed in via Telegram{" "}
              {process.env.NODE_ENV === "development" ? "(Mock)" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="text-xs text-zinc-500 hover:text-white"
          >
            ✕
          </button>
        </div>
      ) : (
        <p className="text-xs text-red-400">
          Failed to load Telegram user data.
        </p>
      )}
    </div>
  );
}
