"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { checkIsTelegram } from "@/lib/telegram";

type SessionLike = {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  } | null;
} | null;

export function AuthActions({
  session,
  role,
}: {
  session: SessionLike;
  role: string;
}) {
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    if (checkIsTelegram()) {
      setIsTelegram(true);
      return;
    }

    const interval = setInterval(() => {
      if (checkIsTelegram()) {
        setIsTelegram(true);
        clearInterval(interval);
      }
    }, 100);

    const timeout = setTimeout(() => clearInterval(interval), 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {role === "ADMIN" ? (
          <Button asChild className="bg-card-foreground border-primary border">
            <Link href="/admin" className="text-primary">
              Dashboard
            </Link>
          </Button>
        ) : (
          <Button asChild className="bg-card-foreground border-primary border">
            <Link href="/dashboard" className="text-primary">
              Dashboard
            </Link>
          </Button>
        )}

        {!isTelegram && (
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
        )}
      </div>
    );
  }

  if (isTelegram) {
    return null;
  }

  return (
    <div className="flex flex-row gap-2">
      <Button asChild>
        <Link href="/sign-in">Sign In</Link>
      </Button>
      <Button asChild className="bg-card-foreground border-primary border">
        <Link href="/sign-up" className="text-primary">
          Sign up
        </Link>
      </Button>
    </div>
  );
}
