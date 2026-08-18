"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { WebApp as TeleWebApp } from "@twa-dev/types";

declare global {
  interface Window {
    Telegram?: {
      WebApp: TeleWebApp;
    };
  }
}

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

export default function TelegramAuth() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initTelegram = async () => {
      if (typeof window !== "undefined") {
        const WebApp = (await import("@twa-dev/sdk")).default;
        WebApp.ready();

        if (WebApp.initDataUnsafe?.user) {
          setUserData(WebApp.initDataUnsafe.user as UserData);
        }
      }
      setLoading(false);
    };

    initTelegram();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 text-white">
      <div className="rounded-lg bg-zinc-900 p-6 text-center">
        {loading ? (
          <p className="animate-pulse text-sm">
            Authenticating with Telegram...
          </p>
        ) : userData ? (
          <>
            <h1 className="mb-4 text-2xl font-bold">User Data</h1>
            <ul className="text-left text-sm space-y-1">
              <li>ID: {userData.id}</li>
              <li>First Name: {userData.first_name}</li>
              <li>Last Name: {userData.last_name || "N/A"}</li>
              <li>Username: {userData.username || "N/A"}</li>
              <li>Language Code: {userData.language_code}</li>
              <li>Is Premium: {userData.is_premium ? "Yes" : "No"}</li>
            </ul>
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
