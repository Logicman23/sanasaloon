import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect, unstable_rethrow } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { PosLoginForm } from "@/components/pos/login-form";
import { getStaff } from "@/lib/pos/auth";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Staff Login" };

export default function PosLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-plum-800">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to website
        </Link>
        <div className="rounded-3xl border border-plum-100 bg-white p-8 shadow-sm">
          <p className="font-display text-2xl font-semibold text-plum-800">{SITE.shortName}</p>
          <h1 className="mt-1 text-sm font-medium tracking-[0.2em] text-gold-600 uppercase">Staff POS Login</h1>
          <div className="mt-8">
            <Suspense fallback={<div className="h-56 animate-pulse rounded-2xl bg-plum-50" />}>
              <RedirectIfSignedIn>
                <PosLoginForm />
              </RedirectIfSignedIn>
            </Suspense>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-ink/50">
          Staff accounts are created by the salon owner. Ask them if you need access.
        </p>
      </div>
    </main>
  );
}

async function RedirectIfSignedIn({ children }: { children: ReactNode }) {
  // If the session can't be checked (e.g. not configured), still show the login form.
  const auth = await getStaff().catch((err) => {
    unstable_rethrow(err);
    return { status: "signed-out" } as const;
  });
  if (auth.status === "staff") redirect("/pos");
  return children;
}
