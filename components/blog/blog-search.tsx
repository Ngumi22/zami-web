"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlogSearchProps {
  tags: string[];
}

export function BlogSearch({ tags }: BlogSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedTag, setSelectedTag] = useState(searchParams.get("tag") || "");

  const hasActiveFilters = searchTerm || selectedTag;

  const handleSearch = () => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (selectedTag) params.set("tag", selectedTag);

      const queryString = params.toString();
      router.push(`/blog${queryString ? `?${queryString}` : ""}`);
    });
  };

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag === "all" ? "" : tag);
    startTransition(() => {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (tag !== "all") params.set("tag", tag);

      const queryString = params.toString();
      router.push(`/blog${queryString ? `?${queryString}` : ""}`);
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag("");
    startTransition(() => {
      router.push("/blog");
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
      <Select value={selectedTag || "all"} onValueChange={handleTagChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag} value={tag}>
              {tag}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Input
          placeholder="Search Here..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full sm:w-64"
          disabled={isPending}
        />
        <Button
          onClick={handleSearch}
          disabled={isPending}
          className="bg-black hover:bg-gray-800 text-white px-6">
          <Search className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Search</span>
        </Button>

        {hasActiveFilters && (
          <Button
            onClick={clearFilters}
            variant="outline"
            disabled={isPending}
            className="px-3"
            title="Clear all filters">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
