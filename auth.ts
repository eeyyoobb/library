import NextAuth, { User } from "next-auth";
import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

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
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
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
    CredentialsProvider({
      id: "telegram",
      name: "Telegram",

      credentials: {
        telegramId: { label: "Telegram ID", type: "text" },
        firstName: { label: "First Name", type: "text" },
        lastName: { label: "Last Name", type: "text" },
        username: { label: "Username", type: "text" },
      },

      async authorize(credentials) {
        const telegramId = credentials?.telegramId?.toString();
        const firstName = credentials?.firstName?.toString();
        const lastName = credentials?.lastName?.toString() || "";
        const username = credentials?.username?.toString() || "";

        if (!telegramId || !firstName) {
          return null;
        }

        const email = `${username || `tg_${telegramId}`}@telegram.user`;
        const fullName = [firstName, lastName].filter(Boolean).join(" ");

        // 1. Check if user already exists by telegramId
        const existingUsers = await db
          .select()
          .from(users)
          .where(eq(users.telegramId, telegramId))
          .limit(1);

        let currentUser = existingUsers[0];

        // 2. Create the user record in database if not found
        if (!currentUser) {
          const [newUser] = await db
            .insert(users)
            .values({
              telegramId,
              fullName,
              email,
              role: "USER",
            })
            .returning();

          currentUser = newUser;
        }

        return {
          id: currentUser.id.toString(),
          email: currentUser.email ?? undefined,
          name: currentUser.fullName,
        } as User;
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
