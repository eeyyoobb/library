"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

type SessionLike = {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  } | null;
} | null;

export function AuthActions({ session }: { session: SessionLike }) {
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);

  useEffect(() => {
    const telegram =
      typeof window !== "undefined" ? window.Telegram?.WebApp : null;
    setIsTelegramEnvironment(Boolean(telegram));
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

  if (isTelegramEnvironment) {
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
