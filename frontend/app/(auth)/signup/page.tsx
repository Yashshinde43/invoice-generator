'use client'

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/app/actions/auth-firebase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, ArrowRight, AlertCircle, MailCheck } from "lucide-react";
import { useEffect, useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium text-sm transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Creating account…
        </span>
      ) : (
        <>
          Create account
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useActionState(signUp, null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (state?.error) {
      setErrorMessage(state.error);
    } else if (state?.success && state?.message) {
      setCountdown(5);
    }
  }, [state]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { router.push("/login"); return; }
    const timer = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  const progress = countdown !== null ? ((5 - countdown) / 5) * 100 : 0;

  return (
    <>
      {/* Email confirmation overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Progress bar */}
            <div className="h-1 bg-gray-100 dark:bg-gray-800 w-full">
              <div
                className="h-full bg-green-500 transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="p-8 text-center">
              <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-green-100 dark:bg-green-950/60 flex items-center justify-center">
                <MailCheck className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>

              <h2 className="text-xl font-serif font-normal text-gray-900 dark:text-white mb-2">
                Check your inbox
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                We sent a confirmation link to your email. Click it to activate your account before signing in.
              </p>

              {/* Countdown ring */}
              <div className="flex flex-col items-center gap-1.5 mb-6">
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-200 dark:text-gray-800" />
                    <circle
                      cx="28" cy="28" r="24"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 24}`}
                      strokeDashoffset={`${2 * Math.PI * 24 * (countdown / 5)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800 dark:text-white">
                    {countdown}
                  </span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Redirecting to sign in…</p>
              </div>

              <button
                onClick={() => router.push("/login")}
                className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Go to sign in now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/30">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white tracking-tight">InvoiceBuilder</span>
          </div>

          <h1 className="text-3xl font-serif font-normal text-gray-900 dark:text-white tracking-tight">
            Create your account
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Get started free — no credit card required
          </p>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form action={formAction} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Full name
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                className="pl-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 dark:focus-visible:border-emerald-500 rounded-xl transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 dark:focus-visible:border-emerald-500 rounded-xl transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                className="pl-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 dark:focus-visible:border-emerald-500 rounded-xl transition-colors"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              required
              className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 accent-emerald-600 cursor-pointer"
            />
            <Label htmlFor="terms" className="text-sm text-gray-500 dark:text-gray-400 font-normal leading-relaxed cursor-pointer">
              I agree to the{" "}
              <Link href="/terms" className="text-gray-800 dark:text-gray-200 font-medium hover:underline underline-offset-2">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-gray-800 dark:text-gray-200 font-medium hover:underline underline-offset-2">
                Privacy Policy
              </Link>
            </Label>
          </div>

          <SubmitButton />
        </form>

        {/* Footer */}
        <div className="text-center space-y-3 pt-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-gray-900 dark:text-white font-semibold hover:underline underline-offset-2 transition-colors">
              Sign in
            </Link>
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 transition-colors" 
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </>
  );
}
