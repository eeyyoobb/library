import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BookList from "@/components/BookList";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";

const Page = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return <p className="text-white">Please sign in to view books.</p>;
  }
  const latestBooks = (await db
    .select()
    .from(books)
    .where(eq(books.uploader, session?.user.id))
    .limit(10)
    .orderBy(desc(books.createdAt))) as Book[];

  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">All Books</h2>
        <Button className="bg-primary-admin" asChild>
          <Link href="/admin/books/new" className="text-white">
            + Create a New Book
          </Link>
        </Button>
      </div>

      <div className="mt-7 w-full overflow-hidden">
        <p>Table</p>
      </div>
      <BookList
        title="My Books"
        books={latestBooks}
        containerClassName="mt-28"
      />
    </section>
  );
};

export default Page;
