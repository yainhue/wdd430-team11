"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, type FormEvent } from "react";

type AccountRole = "customer" | "provider";
type AuthMode = "login" | "register";

export function AuthScreen() {
  const { data: session, status, update } = useSession();
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<AccountRole>("customer");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    try {
      if (mode === "register") {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.get("name"),
            email,
            password,
            role: formData.get("role"),
          }),
        });
        const result = (await response.json()) as { error?: string };

        if (!response.ok) {
          setMessage(result.error ?? "We couldn't create your account.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setMessage(
          mode === "register"
            ? "Your account was created, but sign-in failed. Please try logging in."
            : "That email and password don't match. Please try again.",
        );
        if (mode === "register") setMode("login");
        return;
      }

      await update();
    } catch {
      setMessage("We couldn't connect. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-slate-500">Loading your SkillLink account…</p>
      </main>
    );
  }

  if (session?.user) {
    const roleLabel =
      session.user.role === "provider" ? "service provider" : "customer";

    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 sm:p-12">
          <BrandLogo className="mx-auto size-36 rounded-full bg-white object-contain p-1 shadow-sm" />
          <div className="mx-auto mt-10 flex size-16 items-center justify-center rounded-full bg-blue-100 text-[#123984]">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-8"
            >
              <path
                d="m5 12.5 4.5 4.5L19 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
            Welcome to SkillLink{session.user.name ? `, ${session.user.name}` : ""}
          </h1>
          <p className="mt-3 text-slate-600">
            You’re signed in as a {roleLabel}. Your local services journey starts
            here.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/services"
              className="rounded-xl bg-[#c2410c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9a3412]"
            >
              Browse services
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Edit profile
            </Link>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="mt-8 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Sign out
          </button>
        </section>
      </main>
    );
  }

  const isRegistering = mode === "register";

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative flex min-h-[360px] flex-col overflow-hidden bg-[#0b2f80] px-7 py-8 text-white sm:px-12 lg:min-h-screen lg:px-16 lg:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-36 -top-32 size-[440px] rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-16 size-[310px] rounded-full border border-white/10"
        />
        <BrandLogo className="relative z-10 size-24 rounded-full bg-white object-contain p-1 shadow-sm" />
        <div className="relative my-auto max-w-xl py-12 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-2 text-xs font-medium tracking-wide text-blue-100">
            <span className="size-1.5 rounded-full bg-[#ff6b00]" />
            YOUR COMMUNITY, CONNECTED
          </span>
          <h1 className="mt-7 max-w-lg text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
            Good work is closer than you think.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-blue-50/80 sm:text-lg">
            Find trusted people for the jobs that matter, or turn your skills
            into a service your neighbors can count on.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-blue-50">
              <span className="text-[#ff8a33]">✓</span> Local professionals
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-blue-50">
              <span className="text-[#ff8a33]">✓</span> Skills that help
            </div>
          </div>
        </div>
        <p className="relative text-xs text-blue-100/60">
          Built for the people who make a neighborhood feel like home.
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-9 lg:hidden">
            <BrandLogo className="size-20 rounded-full bg-white object-contain p-0.5 shadow-sm" />
          </div>
          <p className="text-sm font-semibold text-[#123984]">
            {isRegistering ? "JOIN THE COMMUNITY" : "WELCOME BACK"}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {isRegistering ? "Create your account" : "Sign in to SkillLink"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isRegistering
              ? "A few details and you’re ready to get started."
              : "Your next great local connection is waiting."}
          </p>
          <Link
            href="/services"
            className="mt-4 inline-flex text-sm font-semibold text-[#123984] underline-offset-4 hover:underline"
          >
            Browse services without signing in
          </Link>

          <div className="mt-8 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              aria-pressed={!isRegistering}
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                !isRegistering
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              aria-pressed={isRegistering}
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                isRegistering
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {isRegistering && (
              <>
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    minLength={2}
                    maxLength={80}
                    required
                    placeholder="e.g. Alex Morgan"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d95a00] focus:ring-4 focus:ring-[#d95a00]/10"
                  />
                </div>
                <div>
                  <label
                    htmlFor="role"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    I’m joining as a
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={(event) =>
                      setRole(
                        event.target.value === "provider"
                          ? "provider"
                          : "customer",
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#d95a00] focus:ring-4 focus:ring-[#d95a00]/10"
                  >
                    <option value="customer">Customer — I need a service</option>
                    <option value="provider">
                      Service provider — I offer services
                    </option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d95a00] focus:ring-4 focus:ring-[#d95a00]/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isRegistering ? "new-password" : "current-password"}
                minLength={isRegistering ? 8 : undefined}
                maxLength={128}
                required
                placeholder={
                  isRegistering ? "At least 8 characters" : "Enter your password"
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d95a00] focus:ring-4 focus:ring-[#d95a00]/10"
              />
            </div>

            {message && (
              <p
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c2410c] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-900/10 transition hover:bg-[#9a3412] focus:outline-none focus:ring-4 focus:ring-[#d95a00]/20 disabled:cursor-not-allowed disabled:opacity-65"
            >
              {isSubmitting
                ? "Please wait…"
                : isRegistering
                  ? "Create account"
                  : "Sign in"}
              {!isSubmitting && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="size-4"
                >
                  <path
                    d="M4 10h12m0 0-5-5m5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-xs leading-5 text-slate-400">
            By continuing, you agree to use SkillLink respectfully and keep
            account details secure.
          </p>
        </div>
      </section>
    </main>
  );
}

function BrandLogo({ className }: { className: string }) {
  return (
    <Image
      src="/skilllink-logo.png"
      alt="SkillLink Home Services"
      width={768}
      height={768}
      priority
      className={className}
    />
  );
}
