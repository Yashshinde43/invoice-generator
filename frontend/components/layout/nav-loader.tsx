"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";

function NavLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevRef = useRef(pathname + searchParams.toString());

  useEffect(() => {
    const current = pathname + searchParams.toString();
    if (current !== prevRef.current) {
      // Route completed — finish the bar
      setWidth(100);
      setTimeout(() => {
        setLoading(false);
        setWidth(0);
      }, 300);
      prevRef.current = current;
    }
  }, [pathname, searchParams]);

  // Expose a way for nav links to trigger the loader
  useEffect(() => {
    const handler = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setWidth(0);
      setLoading(true);
      // Crawl from 0 → ~85% while waiting
      let w = 0;
      intervalRef.current = setInterval(() => {
        w += Math.random() * 12;
        if (w > 85) { w = 85; clearInterval(intervalRef.current!); }
        setWidth(w);
      }, 200);
    };
    window.addEventListener("nav-start", handler);
    return () => window.removeEventListener("nav-start", handler);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none">
      <div
        className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,168,105,0.7)] transition-all duration-200 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export function NavLoader() {
  return (
    <Suspense>
      <NavLoaderInner />
    </Suspense>
  );
}
