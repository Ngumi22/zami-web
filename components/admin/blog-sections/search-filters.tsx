"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Search,
  X,
  CalendarIcon,
  SlidersHorizontal,
  Tag,
  User,
  Folder,
  Star,
  RotateCcw,
} from "lucide-react";

interface SearchFiltersProps {
  categories: string[];
  authors: string[];
  allTags: string[];
  onFiltersChange: (filters: any) => void;
  isLoading?: boolean;
}

export function BlogSearchFilters({
  categories,
  authors,
  allTags,
  onFiltersChange,
  isLoading,
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for all filters
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [author, setAuthor] = useState(searchParams.get("author") || "all");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get("tags")?.split(",").filter(Boolean) || []
  );
  const [featured, setFeatured] = useState<boolean | undefined>(
    searchParams.get("featured") === "true"
      ? true
      : searchParams.get("featured") === "false"
      ? false
      : undefined
  );
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    searchParams.get("dateFrom")
      ? new Date(searchParams.get("dateFrom")!)
      : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    searchParams.get("dateTo")
      ? new Date(searchParams.get("dateTo")!)
      : undefined
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "createdAt"
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sortOrder") || "desc"
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounced search query
  const debouncedQuery = useDebounce(query, 300);

  // Update URL and trigger search when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedQuery) params.set("query", debouncedQuery);
    if (category !== "all") params.set("category", category);
    if (status !== "all") params.set("status", status);
    if (author !== "all") params.set("author", author);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    if (featured !== undefined) params.set("featured", featured.toString());
    if (dateFrom) params.set("dateFrom", dateFrom.toISOString().split("T")[0]);
    if (dateTo) params.set("dateTo", dateTo.toISOString().split("T")[0]);
    if (sortBy !== "createdAt") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);

    // Update URL without triggering navigation
    const newUrl = params.toString() ? `?${params.toString()}` : "";
    window.history.replaceState({}, "", `/admin/blog${newUrl}`);

    // Trigger search
    onFiltersChange({
      query: debouncedQuery,
      category: category === "all" ? undefined : category,
      status: status === "all" ? undefined : status,
      author: author === "all" ? undefined : author,
      tags: selectedTags,
      featured,
      dateFrom: dateFrom?.toISOString().split("T")[0],
      dateTo: dateTo?.toISOString().split("T")[0],
      sortBy,
      sortOrder,
    });
  }, [
    debouncedQuery,
    category,
    status,
    author,
    selectedTags,
    featured,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    onFiltersChange,
  ]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setQuery("");
    setCategory("all");
    setStatus("all");
    setAuthor("all");
    setSelectedTags([]);
    setFeatured(undefined);
    setDateFrom(undefined);
    setDateTo(undefined);
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  const hasActiveFilters =
    query ||
    category !== "all" ||
    status !== "all" ||
    author !== "all" ||
    selectedTags.length > 0 ||
    featured !== undefined ||
    dateFrom ||
    dateTo ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(showAdvanced && "bg-muted")}>
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search posts by title, content, tags, or author..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Category
            </Label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2">Status</Label>
            <Select
              value={status}
              onValueChange={setStatus}
              disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Author
            </Label>
            <Select
              value={author}
              onValueChange={setAuthor}
              disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {authors.map((auth) => (
                  <SelectItem key={auth} value={auth}>
                    {auth}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleContent className="space-y-6">
            <Separator />

            {/* Tags Filter */}
            <div>
              <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags ({selectedTags.length} selected)
              </Label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => handleTagToggle(tag)}>
                    {tag}
                    {selectedTags.includes(tag) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="featured-filter"
                checked={featured === true}
                onCheckedChange={(checked) =>
                  setFeatured(checked ? true : undefined)
                }
                disabled={isLoading}
              />
              <Label
                htmlFor="featured-filter"
                className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Featured posts only
              </Label>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2">From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                      disabled={isLoading}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2">To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                      disabled={isLoading}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2">Sort By</Label>
                <Select
                  value={sortBy}
                  onValueChange={setSortBy}
                  disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="updatedAt">Updated Date</SelectItem>
                    <SelectItem value="publishedAt">Published Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="views">Views</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2">Sort Order</Label>
                <Select
                  value={sortOrder}
                  onValueChange={setSortOrder}
                  disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>
            {query && (
              <Badge variant="secondary">
                Search: "{query}"
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setQuery("")}
                />
              </Badge>
            )}
            {category !== "all" && (
              <Badge variant="secondary">
                Category: {category}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setCategory("all")}
                />
              </Badge>
            )}
            {status !== "all" && (
              <Badge variant="secondary">
                Status: {status}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setStatus("all")}
                />
              </Badge>
            )}
            {author !== "all" && (
              <Badge variant="secondary">
                Author: {author}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setAuthor("all")}
                />
              </Badge>
            )}
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary">
                Tag: {tag}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                />
              </Badge>
            ))}
            {featured !== undefined && (
              <Badge variant="secondary">
                Featured: {featured ? "Yes" : "No"}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setFeatured(undefined)}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
