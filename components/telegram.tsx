"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import WebApp from "@twa-dev/sdk";
import { WebApp as TELEG } from "@twa-dev/types";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TELEG;
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
  // const [userData, setUserData] = useState<UserData | null>(null);
  const [checking, setChecking] = useState(true);

  // useEffect(() => {
  //   if (WebApp.initDataUnsafe.user) {
  //     setUserData(WebApp.initDataUnsafe.user as UserData);
  //   }
  // }, []);

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
      {/* {userData ? (
        <>
          <h1 className="text-2xl font-bold mb-4">User Data</h1>
          <ul>
            <li>ID: {userData.id}</li>
            <li>First Name: {userData.first_name}</li>
            <li>Last Name: {userData.last_name || "N/A"}</li>
            <li>Username: {userData.username || "N/A"}</li>
            <li>Language Code: {userData.language_code}</li>
            <li>Is Premium: {userData.is_premium ? "Yes" : "No"}</li>
          </ul>
        </>
      ) : (
        <div>Loading...</div>
      )} */}
    </div>
  );
}
