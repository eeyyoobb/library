"use server";

import { db } from "@/database/drizzle";
import { searches, books } from "@/database/schema";
import { auth } from "@/auth";
import { ilike, or, sql } from "drizzle-orm";

export async function searchBooks(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const searchTerm = `%${trimmed}%`;

  return db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      category: books.category,
      genre: books.genre,
      subcategory: books.subcategory,
      coverUrl: books.coverUrl,
      coverColor: books.coverColor,
      matchedKeywords: sql<string[]>`
        COALESCE(
          (SELECT array_agg(k) 
           FROM unnest(${books.keywords}) k 
           WHERE k ILIKE ${searchTerm}), 
          ARRAY[]::text[]
        )
      `,
      matchedTopics: sql<string[]>`
        COALESCE(
          (SELECT array_agg(t) 
           FROM unnest(${books.topics}) t 
           WHERE t ILIKE ${searchTerm}), 
          ARRAY[]::text[]
        )
      `,
    })
    .from(books)
    .where(
      or(
        ilike(books.title, searchTerm),
        ilike(books.author, searchTerm),
        ilike(books.genre, searchTerm),
        ilike(books.category, searchTerm),
        ilike(books.subcategory, searchTerm),
        ilike(books.description, searchTerm),
        sql`EXISTS (
          SELECT 1 FROM unnest(${books.keywords}) k WHERE k ILIKE ${searchTerm}
        )`,
        sql`EXISTS (
          SELECT 1 FROM unnest(${books.topics}) t WHERE t ILIKE ${searchTerm}
        )`,
      ),
    )
    .limit(20);
}

export async function requestBook(query: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("You must be signed in.");
  }

  const request = query.trim();
  if (!request) {
    throw new Error("Invalid request.");
  }

  await db.insert(searches).values({
    userId: session.user.id,
    request,
    found: false,
  });

  return { success: true };
}
