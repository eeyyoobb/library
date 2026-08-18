"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WebApp from "@twa-dev/sdk";
import { authenticateTelegramUser } from "@/lib/actions/auth";

export default function TelegramAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        WebApp.ready();
        WebApp.expand();

        const initData = WebApp.initData;

        // Skip if running outside Telegram
        if (!initData) {
          setLoading(false);
          return;
        }

        // Send initData directly to server action to handle Neon DB + NextAuth session
        const result = await authenticateTelegramUser(initData);

        if (result.success) {
          router.refresh();
        }
      } catch (err) {
        console.error("Telegram authentication error:", err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, [router]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 text-white">
      <div className="rounded-lg bg-zinc-900 p-6 text-center">
        <p className="animate-pulse text-sm">Authenticating with Telegram...</p>
      </div>
    </div>
  );
}
