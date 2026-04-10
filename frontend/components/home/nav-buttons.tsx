"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface NavButtonsProps {
  loginClass: string;
  getStartedClass: string;
}

export function NavButtons({ loginClass, getStartedClass }: NavButtonsProps) {
  const router = useRouter();
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingSignup, setLoadingSignup] = useState(false);

  const navigate = (
    href: string,
    setLoading: (v: boolean) => void
  ) => {
    setLoading(true);
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => navigate("/login", setLoadingLogin)}
        disabled={loadingLogin || loadingSignup}
        className={loginClass}
        style={{ minWidth: 72 }}
      >
        {loadingLogin ? <Spinner /> : "Login"}
      </button>
      <button
        onClick={() => navigate("/signup", setLoadingSignup)}
        disabled={loadingLogin || loadingSignup}
        className={getStartedClass}
        style={{ minWidth: 120 }}
      >
        {loadingSignup ? <Spinner light /> : "Get started free"}
      </button>
    </>
  );
}

function Spinner({ light }: { light?: boolean }) {
  return (
    <span className="flex items-center justify-center">
      <svg
        className={`animate-spin h-4 w-4 ${light ? "text-white" : "currentColor"}`}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12" cy="12" r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
    </span>
  );
}
