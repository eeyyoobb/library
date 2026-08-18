"use server";

import { db } from "@/database/drizzle";
import { books, borrowRecords, users } from "@/database/schema";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import dayjs from "dayjs";

const BOOKS_DOMAIN = process.env.BOOKS_DOMAIN || "https://bookwfw.net";

export const borrowBook = async (params: BorrowBookParams) => {
  const { userId, bookId } = params;

  try {
    // 1. Get book
    const [book] = await db
      .select({
        id: books.id,
        title: books.title,
        packageUrl: books.packageUrl,
      })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book) {
      return {
        success: false,
        error: "Book not found",
      };
    }

    if (!book.packageUrl) {
      return {
        success: false,
        error: "Book package is not available",
      };
    }

    // 2. Atomically consume ONE quota
    const [updatedUser] = await db
      .update(users)
      .set({
        downloads: sql`${users.downloads} + 1`,
      })
      .where(
        and(
          eq(users.id, userId),
          lt(users.downloads, users.quota), // Ensures downloads < quota before incrementing
        ),
      )
      .returning({
        id: users.id,
        downloads: users.downloads,
        quota: users.quota,
      });

    // 3. No quota available
    if (!updatedUser) {
      return {
        success: false,
        error: " You have reached your download quota limit.",
      };
    }

    // 4. Create borrowing record
    const dueDate = dayjs().add(7, "day").toDate().toDateString();

    const [record] = await db
      .insert(borrowRecords)
      .values({
        userId,
        bookId,
        dueDate,
        status: "BORROWED",
      })
      .returning();

    // 5. Generate download URL
    const now = dayjs();

    const day = now.date();
    const month = now.month() + 1;

    const dateCode = Math.max(day - month, 0)
      .toString()
      .padStart(2, "0");

    const publicBookUrl = `${BOOKS_DOMAIN}/${book.id}${dateCode}`;

    return {
      success: true,
      downloadUrl: publicBookUrl,
      fileName: `${book.id}.zip`,
      downloads: updatedUser.downloads,
      data: JSON.parse(JSON.stringify(record)),
    };
  } catch (error) {
    console.error("[BORROW BOOK]", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An error occurred while borrowing the book",
    };
  }
};
