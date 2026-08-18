"use client";

import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

export default function TelegramUser() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && WebApp.initDataUnsafe?.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData);
    }
  }, []);

  if (!userData) {
    return <div className="text-gray-500">Loading user data...</div>;
  }

  return (
    <div className="mb-6 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
      <h2 className="text-xl font-bold mb-2">Telegram Profile</h2>
      <ul className="space-y-1 text-sm">
        <li>
          <span className="font-semibold">ID:</span> {userData.id}
        </li>
        <li>
          <span className="font-semibold">Name:</span> {userData.first_name}{" "}
          {userData.last_name || ""}
        </li>
        <li>
          <span className="font-semibold">Username:</span>{" "}
          {userData.username ? `@${userData.username}` : "N/A"}
        </li>
        <li>
          <span className="font-semibold">Language:</span>{" "}
          {userData.language_code}
        </li>
        <li>
          <span className="font-semibold">Premium:</span>{" "}
          {userData.is_premium ? "Yes" : "No"}
        </li>
      </ul>
    </div>
  );
}
