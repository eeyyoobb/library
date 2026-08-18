"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RequestBookButton } from "./requestButton";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 w-full">
      <Input
        type="text"
        placeholder="Search title, author, category, topics, keywords..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full text-white"
      />
    </form>
  );
}
