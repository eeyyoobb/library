"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { borrowBook } from "@/lib/actions/book";
import { Check, Copy, ExternalLink } from "lucide-react";

interface Props {
  userId: string;
  bookId: string;
  borrowingEligibility: {
    isEligible: boolean;
    message: string;
  };
}

const BorrowBook = ({
  userId,
  bookId,
  borrowingEligibility: { isEligible, message },
}: Props) => {
  const router = useRouter();

  const [borrowing, setBorrowing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleBorrowBook = async () => {
    // if (!isEligible) {
    //   toast({
    //     title: "Cannot borrow",
    //     description: message,
    //     variant: "destructive",
    //   });
    //   return;
    // }

    setBorrowing(true);
    setCopied(false);

    try {
      const result = await borrowBook({
        bookId,
        userId,
      });

      if (!result.success || !result.downloadUrl) {
        toast({
          title: "Error",
          description: result.error || "Failed to retrieve download link",
          variant: "destructive",
        });
        return;
      }

      setDownloadUrl(result.downloadUrl);

      toast({
        title: "Success",
        description: "Book borrowed successfully.",
      });

      router.refresh();
    } catch (error) {
      console.error("[BORROW BOOK]", error);

      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while borrowing the book",
        variant: "destructive",
      });
    } finally {
      setBorrowing(false);
    }
  };

  const handleCopy = async () => {
    if (!downloadUrl) return;

    try {
      await navigator.clipboard.writeText(downloadUrl);

      setCopied(true);

      toast({
        title: "Copied",
        description: "Book link copied to clipboard",
      });

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("[COPY BOOK LINK]", error);

      toast({
        title: "Copy failed",
        description: "Could not copy the book link.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        className="book-overview_btn flex items-center justify-center gap-2"
        onClick={handleBorrowBook}
        disabled={borrowing}
      >
        <Image src="/icons/book.svg" alt="book" width={20} height={20} />

        <p className="font-bebas-neue text-xl text-dark-100">
          {borrowing ? "Borrowing..." : "Borrow Book"}
        </p>
      </Button>

      {downloadUrl && (
        <div className="flex flex-col gap-2 p-3 bg-slate-800 rounded-md">
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={downloadUrl}
              className="flex-1 min-w-0 bg-transparent text-sm text-slate-200 outline-none"
            />

            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={handleCopy}
              className="shrink-0 text-slate-200 hover:bg-slate-700"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowBook;
