"use client";

import { Button } from "@/components/ui/button";
import { Plus, Download, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function QuickActions() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Download className="w-4 h-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Download className="w-4 h-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
