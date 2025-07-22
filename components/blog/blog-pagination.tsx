"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  search?: string;
  tag?: string;
}

export function BlogPagination({
  currentPage,
  totalPages,
  search,
  tag,
}: BlogPaginationProps) {
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tag) params.set("tag", tag);
    if (page > 1) params.set("page", page.toString());

    const queryString = params.toString();
    return `/blog${queryString ? `?${queryString}` : ""}`;
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      {currentPage > 1 && (
        <Link href={createPageUrl(currentPage - 1)}>
          <Button variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
      )}

      {getVisiblePages().map((page) => (
        <Link key={page} href={createPageUrl(page)}>
          <Button
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            className={
              currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""
            }>
            {page}
          </Button>
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link href={createPageUrl(currentPage + 1)}>
          <Button variant="outline" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}
