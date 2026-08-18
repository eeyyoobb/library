"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WebApp from "@twa-dev/sdk";
import { authenticateTelegramUser } from "@/lib/actions/auth";
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
    if (WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData);
    }
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 text-white">
      <div className="rounded-lg bg-zinc-900 p-6 text-center">
        {userData ? (
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
          <p className="animate-pulse text-sm">
            Authenticating with Telegram...
          </p>
        )}
      </div>
    </div>
  );
}
