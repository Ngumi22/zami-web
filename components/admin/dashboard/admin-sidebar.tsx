"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Receipt,
  FileText,
  Building2,
  User,
  LogOut,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logout } from "@/components/account/logout";
import { User as PrismaUser } from "@prisma/client";
import UserButton from "./user-button";

type MenuItem = {
  title: string;
  href?: string;
  icon?: React.ElementType;
  submenu?: MenuItem[];
  badge?: number;
  divider?: boolean;
};

const user = {
  name: "John Doe",
  email: "john@zamidigtial.com",
  avatar: "/placeholder.svg?height=32&width=32",
};

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    icon: Package,
    submenu: [
      {
        title: "All Products",
        href: "/admin/products",
      },
      {
        title: "Categories",
        href: "/admin/categories",
      },
      {
        title: "Brand",
        href: "/admin/brands",
      },
      {
        title: "Collections",
        href: "/admin/collections",
      },
    ],
    divider: true,
  },

  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    divider: true,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
    divider: true,
  },

  {
    title: "Invoices",
    href: "/admin/invoices",
    icon: Receipt,
    divider: true,
  },

  {
    title: "Blog",
    href: "/admin/blog",
    icon: FileText,
    divider: true,
  },

  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

type SubMenuProps = {
  item: MenuItem;
  isOpen: boolean;
  activeHref: string;
  toggleSubmenu: (title: string) => void;
};

const SubMenu = ({ item, isOpen, activeHref, toggleSubmenu }: SubMenuProps) => {
  const isActive =
    item.href === activeHref ||
    item.submenu?.some((subItem) => subItem.href === activeHref);
  const isParentPath = item.submenu?.some(
    (subItem) => subItem.href && activeHref.startsWith(subItem.href)
  );

  return (
    <div className="w-full">
      <button
        onClick={() => toggleSubmenu(item.title)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-2 text-xs font-medium rounded-md transition-colors",
          isActive || isParentPath
            ? "bg-indigo-50 dark:text-indigo-300"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800"
        )}>
        <div className="flex items-center gap-3">
          {item.icon && <item.icon className="h-4 w-4" />}
          <span>{item.title}</span>
          {item.badge && (
            <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-medium  dark:text-indigo-300">
              {item.badge}
            </span>
          )}
        </div>
        <div className="ml-2">
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="mt-1 ml-4 pl-2 border-l border-slate-200 dark:border-slate-700">
          {item.submenu?.map((subItem) => (
            <Link
              key={subItem.title}
              href={subItem.href || "#"}
              className={cn(
                "flex items-center justify-between py-2 px-3 text-xs rounded-md transition-colors",
                activeHref === subItem.href ||
                  (subItem.href && activeHref.startsWith(subItem.href))
                  ? "bg-indigo-50 dark:text-indigo-300"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800"
              )}>
              <span>{subItem.title}</span>
              {subItem.badge && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-medium  dark:text-indigo-300">
                  {subItem.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

type MenuItemProps = {
  item: MenuItem;
  activeHref: string;
};

const MenuItemComponent = ({ item, activeHref }: MenuItemProps) => {
  if (!item.href) return null;

  const isActive =
    activeHref === item.href || activeHref.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors",
        isActive
          ? "bg-indigo-50 dark:text-indigo-300"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800"
      )}>
      {item.icon && <item.icon className="h-4 w-4" />}
      <span>{item.title}</span>
      {item.badge && (
        <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-medium  dark:text-indigo-300">
          {item.badge}
        </span>
      )}
    </Link>
  );
};

interface NavbarProps {
  user: PrismaUser;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const determineOpenSubmenus = () => {
    const shouldBeOpen: string[] = [];

    menuItems.forEach((item) => {
      if (item.submenu) {
        const hasActiveChild = item.submenu.some(
          (subItem) => subItem.href && pathname.startsWith(subItem.href)
        );

        if (hasActiveChild) {
          shouldBeOpen.push(item.title);
        }
      }
    });

    return shouldBeOpen;
  };

  useEffect(() => {
    setOpenSubmenus(determineOpenSubmenus());
  }, [pathname]);

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  return (
    <>
      <button
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-40 md:hidden flex items-center justify-center h-10 w-10 rounded-md bg-white dark:bg-slate-900 shadow-md"
        aria-label="Toggle Menu">
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed md:sticky top-0 inset-y-0 left-0 z-30 w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm transition-transform duration-300 ease-in-out h-screen",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
        <div className="flex h-16 items-center border-b border-slate-200 dark:border-slate-800 px-4 bg-indigo-50 dark:bg-indigo-950">
          <Link
            prefetch
            href="/admin"
            className="flex items-center gap-2 font-semibold dark:text-indigo-300 text-sm">
            <span>Zami Digital Solutions</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <React.Fragment key={item.title}>
                {item.submenu ? (
                  <SubMenu
                    item={item}
                    isOpen={openSubmenus.includes(item.title)}
                    activeHref={pathname}
                    toggleSubmenu={toggleSubmenu}
                  />
                ) : (
                  <MenuItemComponent item={item} activeHref={pathname} />
                )}
                {item.divider && (
                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-2"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-800/50">
          <UserButton />
        </div>
      </aside>
    </>
  );
}
