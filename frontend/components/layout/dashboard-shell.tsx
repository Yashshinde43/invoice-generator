"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { NavLoader } from "./nav-loader";

interface DashboardShellProps {
  children: React.ReactNode;
  header: React.ReactNode;
}

export function DashboardShell({ children, header }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setCollapsed(JSON.parse(stored));
    setMounted(true);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[hsl(var(--app-bg))]">
      <NavLoader />
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div
        className={mounted ? (collapsed ? "lg:ml-[68px]" : "lg:ml-64") : "lg:ml-64"}
        style={{ transition: "margin-left 300ms cubic-bezier(0.4,0,0.2,1)" }}
      >
        {header}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
