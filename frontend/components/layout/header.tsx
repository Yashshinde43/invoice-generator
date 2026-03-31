"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, User, LogOut, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Business Selector & Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Business Selector */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push('/dashboard/setup')}>
              <Store className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{businessName}</span>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="hidden sm:flex relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search invoices, products, customers..."
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start cursor-pointer">
                  <div className="flex items-center gap-2 w-full">
                    <span className="w-2 h-2 rounded-full bg-warning-500"></span>
                    <span className="font-medium">Low Stock Alert</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Product &quot;Widget A&quot; is running low on stock
                  </p>
                  <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start cursor-pointer">
                  <div className="flex items-center gap-2 w-full">
                    <span className="w-2 h-2 rounded-full bg-success-500"></span>
                    <span className="font-medium">Payment Received</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Received ₹5,000 from John Doe
                  </p>
                  <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start cursor-pointer">
                  <div className="flex items-center gap-2 w-full">
                    <span className="w-2 h-2 rounded-full bg-danger-500"></span>
                    <span className="font-medium">Invoice Overdue</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Invoice #INV0042 is overdue
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Yesterday</p>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback className="bg-primary-600 text-white">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block text-sm font-medium">
                  {userName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/setup')}>
                <Store className="h-4 w-4 mr-2" />
                Store Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-danger-600"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
