'use client'

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/app/actions/auth-firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { FileText, User, Mail, Lock, ArrowRight, AlertCircle, MailCheck } from "lucide-react";
import { useEffect, useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full gap-2" disabled={pending}>
      {pending ? "Creating account..." : (
        <>
          Create Account
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </Button>
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
    if (countdown === 0) {
      router.push("/login");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  const progress = countdown !== null ? ((5 - countdown) / 5) * 100 : 0;

  return (
    <>
      {/* Email confirmation popup overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Top accent bar */}
            <div className="h-1.5 bg-gray-100 w-full">
              <div
                className="h-full bg-green-500 transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="p-8 text-center">
              {/* Icon */}
              <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <MailCheck className="h-8 w-8 text-green-600" />
              </div>

              {/* Heading */}
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox!</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                We sent a confirmation link to your email address. Click the link in the email to activate your account before signing in.
              </p>

              {/* Countdown ring */}
              <div className="flex flex-col items-center gap-1 mb-6">
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#e5e7eb" strokeWidth="4" />
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
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800">
                    {countdown}
                  </span>
                </div>
                <p className="text-xs text-gray-400">Redirecting to sign in...</p>
              </div>

              <button
                onClick={() => router.push("/login")}
                className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Go to Sign In Now
              </button>
            </div>
          </div>
        </div>
      )}

    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription className="text-base">
            Start managing your invoices and inventory
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-danger-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-danger-800">{errorMessage}</p>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                className="pl-10"
                required
                minLength={6}
              />
            </div>
            <p className="text-xs text-gray-500">Must be at least 6 characters long</p>
          </div>
          <div className="flex items-start gap-2">
            <input type="checkbox" id="terms" name="terms" className="mt-1" required />
            <Label htmlFor="terms" className="text-sm text-gray-600 font-normal">
              I agree to the{" "}
              <Link href="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
            </Label>
          </div>
          <SubmitButton />
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or sign up with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" type="button" className="gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </Button>
          <Button variant="outline" type="button" disabled className="gap-2">
            More coming soon
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <span>Back to home</span>
        </Link>
      </CardFooter>
    </Card>
    </>
  );
}
