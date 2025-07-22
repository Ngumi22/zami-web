"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import UserDropdownMenu from "./user";
import { User } from "@/lib/types";
import { getCurrentUser } from "@/data/users/getUser";
import { Notifications } from "./notifications";

export function Navbar() {
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    getCurrentUser("1").then(setUser);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 z-20 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex h-full items-center justify-between px-4 ml-20 md:ml-64">
        <div className="mx-auto relative w-48 md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search..."
            className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <Notifications />
          {user && <UserDropdownMenu user={user} />}
        </div>
      </div>
    </header>
  );
}
