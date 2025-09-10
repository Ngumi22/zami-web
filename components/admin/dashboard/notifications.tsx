import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BellIcon } from "lucide-react";
import { useState } from "react";

export function Notifications() {
  const [notifications, setNotifications] = useState(3);
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className="border-0 hover:bg-none">
        <Button variant="outline">
          <BellIcon className="h-6 w-6 mr-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-[400px] overflow-auto">
        <div className="grid gap-4 p-4">
          <h4 className="font-medium leading-none">Notifications</h4>
          <div className="grid grid-cols-[25px_1fr] items-start pb-2 last:mb-0 last:pb-0">
            <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-blue-500" />
            <div className="grid gap-1">
              <p className="text-sm font-medium">New order received</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                5 min ago
              </p>
            </div>
          </div>
          <div className="grid grid-cols-[25px_1fr] items-start pb-2 last:mb-0 last:pb-0">
            <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-blue-500" />
            <div className="grid gap-1">
              <p className="text-sm font-medium">Payment processed</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                10 min ago
              </p>
            </div>
          </div>
          <div className="grid grid-cols-[25px_1fr] items-start pb-2 last:mb-0 last:pb-0">
            <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-blue-500" />
            <div className="grid gap-1">
              <p className="text-sm font-medium">Item shipped</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                1 hour ago
              </p>
            </div>
          </div>
          <Button variant="outline" className="mt-4">
            Mark All as Read
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
