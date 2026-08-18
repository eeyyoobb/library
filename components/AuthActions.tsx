"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        platform?: string;
      };
    };
  }
}

type SessionLike = {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  } | null;
} | null;

export function AuthActions({ session }: { session: SessionLike }) {
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Telegram injects window.Telegram.WebApp into the webview.
    // Checking for non-empty initData or a non-'unknown' platform confirms Telegram.
    const webApp = window.Telegram?.WebApp;
    const isInsideTelegram = Boolean(
      webApp?.initData && webApp?.platform !== "unknown",
    );

    setIsTelegram(isInsideTelegram);
  }, []);

  if (session?.user) {
    return (
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          await signOut({ callbackUrl: "/" });
        }}
      >
        <Button type="submit" variant="outline">
          Logout
        </Button>
      </form>
    );
  }

  // Hide sign-in/up buttons inside Telegram Mini App
  if (isTelegram) {
    return null;
  }

  return (
    <div className="flex flex-row gap-2">
      <Button asChild>
        <Link href="/sign-in">Sign In</Link>
      </Button>
      <Button className="bg-card-foreground border-primary border">
        <Link href="/sign-up" className="text-primary">
          Sign up
        </Link>
      </Button>
    </div>
  );
}
