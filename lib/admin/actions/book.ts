"use server";

import { books } from "@/database/schema";
import { db } from "@/database/drizzle";

export const createBook = async (params: BookParams) => {
  try {
    const newBook = await db
      .insert(books)
      .values({
        id: params.id,
        title: params.title,
        author: params.author,
        genre: params.genre,

        category: params.category,
        subcategory: params.subcategory || null,

        language: params.language,

        translated: params.translated,
        translator: params.translated ? params.translator || null : null,

        rating: params.rating,

        keywords: params.keywords ?? [],
        topics: params.topics ?? [],

        audience: params.audience,
        tradition: params.tradition,

        coverColor: params.coverColor,

        description: params.description,
        summary: params.summary,

        packageUrl: params.packageUrl,
        coverUrl: params.coverUrl,

        uploader: params.uploader,
      })
      .returning();

    return {
      success: true,
      data: newBook[0],
    };
  } catch (error) {
    console.error("[CREATE BOOK] Database error:", error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Database insert failed",
    };
  }
};
