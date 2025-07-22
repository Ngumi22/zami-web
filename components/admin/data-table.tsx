"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Breakpoint configuration for  visibility
type Breakpoint = "sm" | "md" | "lg" | "xl";

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  searchable?: boolean;
  hiddenOnBreakpoints?: Breakpoint[];
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
  width?: string;
}

interface ActionItem<T> {
  label: string;
  onClick: (item: T) => void;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  filterable?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onRowClick?: (item: T) => void;
  actions?: ActionItem<T>[];
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchable = true,
  filterable = false,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  onRowClick,
  actions = [],
  selectable = false,
  onSelectionChange,
  loading = false,
  emptyMessage = "No data available",
  className = "",
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(
    new Set()
  );
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof T>>(
    new Set(columns.map((col) => col.key))
  );

  // Get current breakpoint class for  visibility
  const getBreakpointClass = (hiddenOnBreakpoints?: Breakpoint[]) => {
    if (!hiddenOnBreakpoints || hiddenOnBreakpoints.length === 0) return "";

    const classes = hiddenOnBreakpoints.map((bp) => {
      switch (bp) {
        case "sm":
          return "hidden sm:table-cell";
        case "md":
          return "hidden md:table-cell";
        case "lg":
          return "hidden lg:table-cell";
        case "xl":
          return "hidden xl:table-cell";
        default:
          return "";
      }
    });

    return classes.join(" ");
  };

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    return data.filter((item) => {
      return columns.some((column) => {
        if (column.searchable === false) return false;
        const value = item[column.key];
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [data, searchQuery, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  // Handle sorting
  const handleSort = (key: keyof T) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  // Handle selection
  const handleSelectItem = (itemId: string | number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);

    const selectedData = data.filter((item) => newSelected.has(item.id));
    onSelectionChange?.(selectedData);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === paginatedData.length) {
      setSelectedItems(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = new Set(paginatedData.map((item) => item.id));
      setSelectedItems(allIds);
      onSelectionChange?.(paginatedData);
    }
  };

  // Handle column visibility
  const toggleColumnVisibility = (columnKey: keyof T) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(columnKey)) {
      newVisible.delete(columnKey);
    } else {
      newVisible.add(columnKey);
    }
    setVisibleColumns(newVisible);
  };

  // Get visible columns
  const displayColumns = columns.filter((col) => visibleColumns.has(col.key));

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortConfig, pageSize]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center flex-1">
          {searchable && (
            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          )}

          {filterable && (
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          )}
        </div>

        {/* Column Visibility Control */}
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Columns
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={String(column.key)}
                  checked={visibleColumns.has(column.key)}
                  onCheckedChange={() => toggleColumnVisibility(column.key)}>
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Selection Summary */}
      {selectable && selectedItems.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Badge variant="secondary">{selectedItems.size} selected</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedItems(new Set());
              onSelectionChange?.([]);
            }}>
            Clear selection
          </Button>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {selectable && (
                  <th className="w-12 py-3 px-4">
                    <Checkbox
                      checked={
                        selectedItems.size === paginatedData.length &&
                        paginatedData.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                )}
                {displayColumns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`text-left py-3 px-4 font-medium text-gray-700 ${
                      column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                    } ${getBreakpointClass(column.hiddenOnBreakpoints)} ${
                      column.className || ""
                    }`}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}>
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortConfig?.key === column.key && (
                        <span className="text-xs">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="w-12 py-3 px-4">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      displayColumns.length +
                      (selectable ? 1 : 0) +
                      (actions.length > 0 ? 1 : 0)
                    }
                    className="py-8 px-4 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b hover:bg-gray-50 ${
                      onRowClick ? "cursor-pointer" : ""
                    } ${selectedItems.has(item.id) ? "bg-blue-50" : ""}`}
                    onClick={() => onRowClick?.(item)}>
                    {selectable && (
                      <td
                        className="py-4 px-4"
                        onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={() => handleSelectItem(item.id)}
                          aria-label={`Select row ${item.id}`}
                        />
                      </td>
                    )}
                    {displayColumns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={`py-4 px-4 ${getBreakpointClass(
                          column.hiddenOnBreakpoints
                        )} ${column.className || ""}`}>
                        {column.render
                          ? column.render(item[column.key], item)
                          : String(item[column.key] || "")}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td
                        className="py-4 px-4"
                        onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions.map((action, index) => (
                              <DropdownMenuItem
                                key={index}
                                onClick={() => action.onClick(item)}
                                className={
                                  action.variant === "destructive"
                                    ? "text-red-600"
                                    : ""
                                }>
                                {action.icon && (
                                  <span className="mr-2">{action.icon}</span>
                                )}
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {paginatedData.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              {emptyMessage}
            </CardContent>
          </Card>
        ) : (
          paginatedData.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedItems.has(item.id) ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => onRowClick?.(item)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {selectable && (
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={() => handleSelectItem(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select item ${item.id}`}
                      />
                    )}
                    <h3 className="font-medium">
                      {displayColumns[0]?.render
                        ? displayColumns[0].render(
                            item[displayColumns[0].key],
                            item
                          )
                        : String(item[displayColumns[0]?.key] || "")}
                    </h3>
                  </div>
                  {actions.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.map((action, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(item);
                            }}
                            className={
                              action.variant === "destructive"
                                ? "text-red-600"
                                : ""
                            }>
                            {action.icon && (
                              <span className="mr-2">{action.icon}</span>
                            )}
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className="space-y-2">
                  {displayColumns.slice(1).map((column) => (
                    <div
                      key={String(column.key)}
                      className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {column.label}:
                      </span>
                      <span className="text-sm font-medium">
                        {column.render
                          ? column.render(item[column.key], item)
                          : String(item[column.key] || "")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white rounded-lg border">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Show</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>of {sortedData.length} results</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}>
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0">
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}>
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
