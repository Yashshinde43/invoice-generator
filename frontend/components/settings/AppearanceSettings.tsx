"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Monitor, Moon, Sun, Check } from "lucide-react"

const themes = [
  { value: "light", label: "Light", desc: "Always use light mode", icon: Sun },
  { value: "dark",  label: "Dark",  desc: "Always use dark mode",  icon: Moon },
  { value: "system",label: "System",desc: "Follow system preference", icon: Monitor },
]

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {themes.map(({ value, label, desc, icon: Icon }) => {
        const active = mounted && theme === value
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`relative p-4 rounded-xl border text-left transition-all ${
              active
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500/50"
                : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.14] bg-white dark:bg-white/[0.02]"
            }`}
          >
            {active && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
              </span>
            )}
            <Icon className={`h-5 w-5 mb-2 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`} />
            <p className={`text-sm font-semibold mb-0.5 ${active ? "text-indigo-700 dark:text-indigo-300" : "text-slate-800 dark:text-slate-200"}`}>
              {label}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">{desc}</p>
          </button>
        )
      })}
    </div>
  )
}
