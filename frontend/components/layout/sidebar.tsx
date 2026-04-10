"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FileText,
  Settings,
  Menu,
  X,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Expenses",  href: "/dashboard/expenses", icon: Wallet },
  { name: "Invoices",  href: "/dashboard/invoices", icon: FileText },
  { name: "Products",  href: "/dashboard/products", icon: Package },
  { name: "Settings",  href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (href: string) => {
    if (pathname !== href) {
      window.dispatchEvent(new Event("nav-start"));
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-lg flex items-center justify-center
          bg-white dark:bg-[#0d0d1a] border border-slate-200 dark:border-white/10
          text-slate-600 dark:text-slate-300 shadow-sm"
      >
        {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0",
          "bg-white dark:bg-[hsl(var(--sidebar-bg))]",
          "border-r border-slate-100 dark:border-[hsl(var(--sidebar-border))]",
          collapsed ? "w-[68px]" : "w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center border-b border-slate-100 dark:border-white/[0.06] flex-shrink-0 overflow-hidden px-4">
          <Link
            href="/dashboard"
            onClick={() => handleNavClick("/dashboard")}
            className="flex items-center gap-2.5 min-w-0"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
              <span className="text-xs font-bold text-white">IB</span>
            </div>
            <span
              className={cn(
                "text-[15px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap transition-all duration-300",
                collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}
            >
              InvoiceBuilder
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleNavClick(item.href)}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-colors relative group",
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
                )} />

                <span className={cn(
                  "whitespace-nowrap transition-all duration-300 overflow-hidden",
                  collapsed ? "opacity-0 w-0" : "opacity-100"
                )}>
                  {item.name}
                </span>

                {isActive && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 flex-shrink-0" />
                )}

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md text-xs font-medium
                    bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900
                    opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150
                    whitespace-nowrap z-50 shadow-lg">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer — collapse toggle */}
        <div className="p-3 border-t border-slate-100 dark:border-white/[0.06] flex-shrink-0">
          <button
            onClick={onToggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
              "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 flex-shrink-0" />
                <span className={cn(
                  "whitespace-nowrap transition-all duration-300 overflow-hidden text-xs",
                  collapsed ? "opacity-0 w-0" : "opacity-100"
                )}>
                  Collapse
                </span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
