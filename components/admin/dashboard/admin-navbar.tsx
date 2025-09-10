"use client";

import UserDropdownMenu from "./user";
import { Notifications } from "./notifications";
import { User } from "@prisma/client";

interface NavbarProps {
  user: User;
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="fixed top-0 right-0 left-0 z-20 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex h-full items-center justify-end px-4 ml-20 md:ml-64">
        <div className="flex items-center justify-center gap-3">
          <Notifications />
          {user && <UserDropdownMenu user={user} />}
        </div>
      </div>
    </header>
  );
}
