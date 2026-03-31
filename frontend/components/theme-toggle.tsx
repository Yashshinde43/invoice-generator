"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return (
    <button className={`w-9 h-9 rounded-lg flex items-center justify-center ${className ?? ""}`} aria-label="Toggle theme" />
  )

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors
        bg-transparent hover:bg-white/10 dark:hover:bg-white/10
        text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100
        border border-transparent hover:border-slate-200 dark:hover:border-white/10
        ${className ?? ""}`}
    >
      {isDark
        ? <Sun className="h-4 w-4" />
        : <Moon className="h-4 w-4" />
      }
    </button>
  )
}
