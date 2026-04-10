"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, LogOut, Store, User, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "@/app/actions/auth-firebase";

interface HeaderProps {
  businessName?: string;
  userName?: string;
  userEmail?: string;
}

export function Header({
  businessName = "My Business",
  userName = "User",
  userEmail = "",
}: HeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <header className="sticky top-0 z-30 w-full h-16 flex items-center px-4 lg:px-6 gap-4
      bg-white/80 dark:bg-[hsl(var(--header-bg))]/90 backdrop-blur-md
      border-b border-slate-100 dark:border-white/[0.06]">

      {/* Business selector */}
      <button
        onClick={() => router.push("/dashboard/setup")}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
          text-slate-600 dark:text-slate-400
          border border-slate-200 dark:border-white/[0.08]
          hover:bg-slate-50 dark:hover:bg-white/[0.04]
          hover:text-slate-900 dark:hover:text-slate-200
          transition-colors"
      >
        <Store className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
        <span>{businessName}</span>
        <ChevronDown className="h-3 w-3 text-slate-400 opacity-60" />
      </button>

      {/* Search */}
      <div className="hidden sm:flex relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-600" />
        <Input
          type="search"
          placeholder="Search invoices, products…"
          className="pl-9 h-9 text-sm bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08]
            placeholder:text-slate-400 dark:placeholder:text-slate-600
            focus-visible:ring-emerald-500/30"
        />
      </div>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1.5">

        {/* Theme toggle */}
        <ThemeToggle />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg
              hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-emerald-600 text-white text-xs font-semibold">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-300">
                {userName}
              </span>
              <ChevronDown className="hidden md:block h-3 w-3 text-slate-400 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 dark:bg-[#111120] dark:border-white/[0.08]">
            <div className="px-3 py-2.5 border-b border-slate-100 dark:border-white/[0.06]">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{userName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{userEmail}</p>
            </div>
            <div className="py-1">
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/setup")}
                className="text-sm gap-2.5 text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                <Store className="h-3.5 w-3.5" /> Store Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm gap-2.5 text-slate-600 dark:text-slate-400 cursor-pointer">
                <User className="h-3.5 w-3.5" /> Profile
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="dark:border-white/[0.06]" />
            <div className="py-1">
              <DropdownMenuItem
                className="text-sm gap-2.5 text-red-600 dark:text-red-400 cursor-pointer"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-3.5 w-3.5" />
                {isLoggingOut ? "Logging out…" : "Logout"}
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
