"use client";

import { parseAsInteger, useQueryState } from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import debounce from "lodash.debounce";
import { useRef } from "react";

export default function SortBar() {
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    shallow: false,
  });
  const [perPage, setPerPage] = useQueryState(
    "perPage",
    parseAsInteger.withDefault(10)
  );

  const debouncedSetSearchRef = useRef(
    debounce((value: string) => {
      setSearch(value);
    }, 800)
  );

  const handleInputChange = (value: string) => {
    debouncedSetSearchRef.current(value);
  };

  const handlePerPageChange = (value: string) => {
    setPerPage(Number(value));
  };

  return (
    <div className="flex justify-between gap-3">
      <div className="flex-1">
        <Input
          placeholder="Search products..."
          className="w-fit"
          defaultValue={search || ""}
          onChange={(e) => handleInputChange(e.target.value)}
        />
      </div>

      <div>
        <Select
          value={perPage.toString()}
          onValueChange={(value) => handlePerPageChange(value)}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Per Page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="30">30 per page</SelectItem>
            <SelectItem value="40">40 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
