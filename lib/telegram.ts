export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

async function hmacSha256(
  key: BufferSource,
  data: string,
): Promise<ArrayBuffer> {
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    "raw",
    key,
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  return globalThis.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(data),
  );
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;

  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

export async function validateTelegramInitData(
  initData: string,
): Promise<TelegramUser> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is missing");
  }

  const params = new URLSearchParams(initData);

  const receivedHash = params.get("hash");

  if (!receivedHash) {
    throw new Error("Telegram hash is missing");
  }

  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  // Telegram secret key:
  // HMAC-SHA256(botToken, "WebAppData")
  const secretKey = await hmacSha256(
    new TextEncoder().encode("WebAppData"),
    botToken,
  );

  // Telegram data hash:
  // HMAC-SHA256(secretKey, dataCheckString)
  const calculatedHashBuffer = await hmacSha256(secretKey, dataCheckString);

  const calculatedHash = bytesToHex(new Uint8Array(calculatedHashBuffer));

  if (!safeEqual(calculatedHash, receivedHash)) {
    throw new Error("Invalid Telegram initData");
  }

  const authDate = Number(params.get("auth_date"));

  if (!authDate) {
    throw new Error("Telegram auth_date is missing");
  }

  // Reject data older than 24 hours.
  const age = Math.floor(Date.now() / 1000) - authDate;

  if (age > 60 * 60 * 24) {
    throw new Error("Telegram initData expired");
  }

  const userJson = params.get("user");

  if (!userJson) {
    throw new Error("Telegram user is missing");
  }

  try {
    return JSON.parse(userJson) as TelegramUser;
  } catch {
    throw new Error("Invalid Telegram user JSON");
  }
}
