"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { WebApp } from "@twa-dev/types";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: WebApp;
    };
  }
}

export default function TelegramAuth() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function authenticate() {
      const telegram = window.Telegram?.WebApp;

      /*
       * NOT Telegram
       */
      if (!telegram) {
        setChecking(false);
        return;
      }

      /*
       * Telegram Mini App
       */
      telegram.ready();

      const initData = telegram.initData;

      if (!initData) {
        console.log("[TelegramAuth] Telegram detected but initData missing");

        setChecking(false);
        return;
      }

      console.log("[TelegramAuth] Telegram Mini App detected");

      try {
        const result = await signIn("telegram", {
          initData,
          redirect: false,
        });

        if (result?.ok) {
          console.log("[TelegramAuth] Telegram login successful");

          router.refresh();

          return;
        }

        console.error("[TelegramAuth] Telegram login failed:", result?.error);
      } catch (error) {
        console.error("[TelegramAuth] Authentication error:", error);
      } finally {
        setChecking(false);
      }
    }

    authenticate();
  }, [router]);

  if (!checking) {
    return null;
  }

  /*
   * Only show this while Telegram authentication
   * is being checked.
   */
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-black px-6 py-4 text-white">
        Signing in with Telegram...
      </div>
    </div>
  );
}
