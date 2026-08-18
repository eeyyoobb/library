"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { requestBook } from "@/lib/actions/search";

interface RequestBookButtonProps {
  query: string;
}

export function RequestBookButton({ query }: RequestBookButtonProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleRequest() {
    try {
      setLoading(true);

      await requestBook(query);

      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Failed to submit book request.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <p className="text-sm text-green-600">Request submitted successfully.</p>
    );
  }

  return (
    <Button type="button" onClick={handleRequest} disabled={loading}>
      {loading ? "Submitting..." : "Request This Book"}
    </Button>
  );
}
