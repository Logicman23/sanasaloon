"use client";

import { CircleAlert, LoaderCircle, LogIn } from "lucide-react";
import { useActionState } from "react";
import { signIn, type SignInState } from "@/app/pos/actions";

const inputClass =
  "block w-full rounded-xl border border-plum-200 bg-white px-4 py-3 text-ink shadow-sm outline-none transition focus:border-plum-500 focus:ring-4 focus:ring-plum-100";

export function PosLoginForm() {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(signIn, { error: null, email: "" });

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p role="alert" className="flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-ink">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-plum-800 px-6 py-3 font-semibold text-white transition hover:bg-plum-900 disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : <LogIn className="size-5" aria-hidden="true" />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
