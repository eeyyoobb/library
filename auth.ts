// auth.ts

import NextAuth, { User } from "next-auth";
import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { validateTelegramInitData } from "@/lib/telegram";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },

  providers: [
    // =====================================================
    // NORMAL EMAIL / PASSWORD LOGIN
    // =====================================================
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email.toString()))
          .limit(1);

        if (user.length === 0) {
          return null;
        }

        // Telegram-only users don't have a password.
        if (!user[0].password) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password.toString(),
          user[0].password,
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user[0].id.toString(),
          email: user[0].email ?? undefined,
          name: user[0].fullName,
        } as User;
      },
    }),

    // =====================================================
    // TELEGRAM MINI APP LOGIN
    // =====================================================
    // =====================================================
    // TELEGRAM MINI APP LOGIN
    // =====================================================
    CredentialsProvider({
      id: "telegram",
      name: "Telegram",

      credentials: {
        initData: {
          label: "Telegram initData",
          type: "text",
        },
      },

      async authorize(credentials) {
        const initData = credentials?.initData;

        if (!initData || typeof initData !== "string") {
          return null;
        }

        try {
          const telegramUser = await validateTelegramInitData(initData);

          const telegramId = String(telegramUser.id);

          const fullName = [telegramUser.first_name, telegramUser.last_name]
            .filter(Boolean)
            .join(" ");

          // Find Telegram account
          const existing = await db
            .select()
            .from(users)
            .where(eq(users.telegramId, telegramId))
            .limit(1);

          // Existing user -> update and sign in
          if (existing.length > 0) {
            const user = existing[0];

            const updated = await db
              .update(users)
              .set({
                fullName,
                telegramUsername: telegramUser.username ?? null,
              })
              .where(eq(users.id, user.id))
              .returning();

            const updatedUser = updated[0] ?? user;

            return {
              id: updatedUser.id.toString(),
              email: updatedUser.email ?? undefined,
              name: updatedUser.fullName,
            } as User;
          }

          // New Telegram user -> save to Neon
          const created = await db
            .insert(users)
            .values({
              fullName,
              email: null,
              password: null,
              telegramId,
              telegramUsername: telegramUser.username ?? null,
              status: "PENDING",
              role: "USER",
            })
            .returning();

          const newUser = created[0];

          if (!newUser) {
            return null;
          }

          return {
            id: newUser.id.toString(),
            email: undefined,
            name: newUser.fullName,
          } as User;
        } catch (error) {
          console.error("[Telegram Auth] Failed:", error);

          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/sign-in",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }

      return session;
    },
  },
});
