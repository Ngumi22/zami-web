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
  BarChart3,
  Menu,
  X,
  Tags,
  Building2,
  Receipt,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MenuItem = {
  title: string;
  href?: string;
  icon?: React.ElementType;
  submenu?: MenuItem[];
  badge?: number;
  divider?: boolean;
};

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Brands", href: "/admin/brands", icon: Building2 },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Invoices", href: "/admin/invoices", icon: Receipt },
  { name: "Blog", href: "/admin/blog", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

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
    ],
    divider: true,
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    badge: 5,
    submenu: [
      {
        title: "All Orders",
        href: "/admin/orders",
      },
      {
        title: "Pending",
        href: "/admin/orders/pending",
        badge: 3,
      },
      {
        title: "Completed",
        href: "/admin/orders/completed",
      },
      {
        title: "Cancelled",
        href: "/admin/orders/cancelled",
      },
    ],
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
    divider: true,
  },
  {
    title: "Analytics",
    icon: BarChart3,
    submenu: [
      {
        title: "Sales",
        href: "/admin/analytics/sales",
      },
      {
        title: "Traffic",
        href: "/admin/analytics/traffic",
      },
      {
        title: "Conversion",
        href: "/admin/analytics/conversion",
      },
    ],
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
          "flex w-full items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors",
          isActive || isParentPath
            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800"
        )}>
        <div className="flex items-center gap-3">
          {item.icon && <item.icon className="h-4 w-4" />}
          <span>{item.title}</span>
          {item.badge && (
            <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
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
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800"
              )}>
              <span>{subItem.title}</span>
              {subItem.badge && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
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
          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800"
      )}>
      {item.icon && <item.icon className="h-4 w-4" />}
      <span>{item.title}</span>
      {item.badge && (
        <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
          {item.badge}
        </span>
      )}
    </Link>
  );
};

interface NavbarProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  } | null;
}

export function AdminSidebar({ user }: NavbarProps) {
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
            href="/admin"
            className="flex items-center gap-2 font-semibold text-indigo-700 dark:text-indigo-300 text-sm">
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

        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-medium">{user?.name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {user?.email}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
