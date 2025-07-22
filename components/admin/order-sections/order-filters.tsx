"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Filter, CalendarIcon, X, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface OrderFiltersProps {
  customerId: string;
}

export function OrderFilters({ customerId }: OrderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset to first page
    router.push(`/admin/customers/${customerId}/orders?${params.toString()}`);
  };

  const handleDateFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (dateFrom) {
      params.set("dateFrom", format(dateFrom, "yyyy-MM-dd"));
    } else {
      params.delete("dateFrom");
    }
    if (dateTo) {
      params.set("dateTo", format(dateTo, "yyyy-MM-dd"));
    } else {
      params.delete("dateTo");
    }
    params.set("page", "1");
    router.push(`/admin/customers/${customerId}/orders?${params.toString()}`);
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    router.push(`/admin/customers/${customerId}/orders`);
  };

  const hasActiveFilters = searchParams.toString() !== "";

  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-4">
          {/* Search Bar - Always Visible */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders, products, tracking..."
              defaultValue={searchParams.get("search") || ""}
              className="pl-10"
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                if (e.target.value) {
                  params.set("search", e.target.value);
                } else {
                  params.delete("search");
                }
                params.set("page", "1");
                router.push(
                  `/admin/customers/${customerId}/orders?${params.toString()}`
                );
              }}
            />
          </div>

          {/* Mobile: Collapsible Filters */}
          <div className="block lg:hidden">
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-transparent">
                  <span className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters {hasActiveFilters && "(Active)"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isFiltersOpen && "rotate-180"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                {/* Status Filters - Mobile */}
                <div className="grid grid-cols-1 gap-3">
                  <Select
                    defaultValue={searchParams.get("status") || "all"}
                    onValueChange={(value) =>
                      handleFilterChange("status", value)
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Order Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    defaultValue={searchParams.get("paymentStatus") || "all"}
                    onValueChange={(value) =>
                      handleFilterChange("paymentStatus", value)
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    defaultValue={searchParams.get("sortBy") || "createdAt"}
                    onValueChange={(value) =>
                      handleFilterChange("sortBy", value)
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Date Created</SelectItem>
                      <SelectItem value="orderNumber">Order Number</SelectItem>
                      <SelectItem value="total">Total Amount</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Filters - Mobile */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal text-sm",
                            !dateFrom && "text-muted-foreground"
                          )}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFrom ? format(dateFrom, "MMM dd") : "From"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={setDateFrom}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal text-sm",
                            !dateTo && "text-muted-foreground"
                          )}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateTo ? format(dateTo, "MMM dd") : "To"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={setDateTo}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleDateFilter}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent">
                      <Filter className="h-4 w-4 mr-2" />
                      Apply Dates
                    </Button>
                    {hasActiveFilters && (
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent">
                        <X className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Desktop: Horizontal Filters */}
          <div className="hidden lg:block">
            <div className="flex flex-wrap gap-3 xl:gap-4">
              <Select
                defaultValue={searchParams.get("status") || "all"}
                onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger className="w-[160px] xl:w-[180px]">
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select
                defaultValue={searchParams.get("paymentStatus") || "all"}
                onValueChange={(value) =>
                  handleFilterChange("paymentStatus", value)
                }>
                <SelectTrigger className="w-[160px] xl:w-[180px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select
                defaultValue={searchParams.get("sortBy") || "createdAt"}
                onValueChange={(value) => handleFilterChange("sortBy", value)}>
                <SelectTrigger className="w-[160px] xl:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="orderNumber">Order Number</SelectItem>
                  <SelectItem value="total">Total Amount</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[120px] xl:w-[140px] justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "MMM dd") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[120px] xl:w-[140px] justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "MMM dd") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Button onClick={handleDateFilter} variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply
                </Button>
              </div>

              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
