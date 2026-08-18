import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BookList from "@/components/BookList";
import { db } from "@/database/drizzle";
import { books, users } from "@/database/schema";
import { desc, eq, count } from "drizzle-orm";
import { auth } from "@/auth";

const DashboardPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  // Fetch user data & stats concurrently
  const [userQuery, booksCountQuery, latestBooks] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    db.select({ value: count() }).from(books).where(eq(books.uploader, userId)),
    db
      .select()
      .from(books)
      .where(eq(books.uploader, userId))
      .limit(10)
      .orderBy(desc(books.createdAt)) as Promise<Book[]>,
  ]);

  const currentUser = userQuery[0];
  const totalUploaded = booksCountQuery[0]?.value ?? 0;
  const userQuota = currentUser?.quota ?? 0;
  const userDownloads = currentUser?.downloads ?? 0;

  return (
    <section className="w-full space-y-8 rounded-2xl bg-slate-50 p-6 md:p-8">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {currentUser?.fullName || "User"} 👋
          </h1>
          <p className="text-sm text-slate-500">
            Overview of your uploaded books, account status, and usage.
          </p>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white" asChild>
          <Link href="/dashboard/books/new">+ Upload New Book</Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Uploads"
          value={totalUploaded}
          subtitle="Books published"
          accentColor="border-l-indigo-500"
        />
        <StatCard
          title="Total Downloads"
          value={userDownloads}
          subtitle="Across all titles"
          accentColor="border-l-emerald-500"
        />
        <StatCard
          title="Remaining Quota"
          value={userQuota}
          subtitle="Upload credits left"
          accentColor="border-l-amber-500"
        />
        <StatCard
          title="Account Status"
          value={currentUser?.status || "PENDING"}
          subtitle={`Role: ${currentUser?.role || "USER"}`}
          accentColor="border-l-sky-500"
          isStatus
        />
      </div>

      {/* Content Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Recent Uploads
          </h2>
          <span className="text-xs font-medium text-slate-500">
            Showing top {latestBooks.length}
          </span>
        </div>

        {latestBooks.length > 0 ? (
          <BookList title="" books={latestBooks} containerClassName="mt-0" />
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-500">
              No books uploaded yet. Click above to add your first book.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

// Reusable Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  accentColor: string;
  isStatus?: boolean;
}

const StatCard = ({
  title,
  value,
  subtitle,
  accentColor,
  isStatus = false,
}: StatCardProps) => (
  <div
    className={`flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm border-l-4 ${accentColor}`}
  >
    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
      {title}
    </p>
    <div className="my-2">
      {isStatus ? (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
          {value}
        </span>
      ) : (
        <span className="text-2xl font-extrabold text-slate-900">{value}</span>
      )}
    </div>
    <p className="text-xs text-slate-400">{subtitle}</p>
  </div>
);

export default DashboardPage;
