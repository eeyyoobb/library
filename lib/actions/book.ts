"use server";

import { db } from "@/database/drizzle";
import { books, borrowRecords } from "@/database/schema";
import { eq } from "drizzle-orm";
import dayjs from "dayjs";

const BOOKS_DOMAIN = process.env.BOOKS_DOMAIN || "https://bookwfw.net";

export const borrowBook = async (params: BorrowBookParams) => {
  const { userId, bookId } = params;

  try {
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

    // Example:
    // f75b8280-2d35-4889-a10c-cf9c08e737af-20260817
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
