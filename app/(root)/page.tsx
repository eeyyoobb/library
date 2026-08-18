import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";

import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { auth } from "@/auth";

import { desc } from "drizzle-orm";
import TelegramAuth from "@/components/telegram";

const Home = async () => {
  const session = await auth();

  const latestBooks = await db
    .select()
    .from(books)
    .orderBy(desc(books.createdAt))
    .limit(10);

  // if (latestBooks.length === 0) {
  //   return <div>No books available.</div>;
  // }

  return (
    <>
      {/* Only does something when opened inside Telegram */}
      <BookOverview {...latestBooks[0]} userId={session?.user?.id as string} />
      <TelegramAuth />
      <div>No telegarm available.</div>;
      <BookList
        title="Latest Books"
        books={latestBooks.slice(1)}
        containerClassName="mt-28"
      />
    </>
  );
};

export default Home;
