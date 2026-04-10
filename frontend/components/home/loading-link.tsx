"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoadingLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  spinnerLight?: boolean;
  style?: React.CSSProperties;
}

export function LoadingLink({
  href,
  className,
  children,
  spinnerLight,
  style,
}: LoadingLinkProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (loading) return;
    setLoading(true);
    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
      style={{ cursor: loading ? "default" : "pointer", ...style }}
    >
      {loading ? (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <svg
            style={{
              width: "1em",
              height: "1em",
              animation: "spin 0.7s linear infinite",
              opacity: spinnerLight ? 0.9 : 0.7,
            }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <circle
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeOpacity="0.25"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
