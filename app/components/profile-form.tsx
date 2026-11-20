"use client";

import { useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";

type ProfileFormProps = {
  initialName: string;
  initialEmail: string;
  role: "customer" | "provider";
};

export function ProfileForm({
  initialName,
  initialEmail,
  role,
}: ProfileFormProps) {
  const { update } = useSession();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const result = (await response.json()) as {
        error?: string;
        profile?: { name: string; email: string };
      };

      if (!response.ok || !result.profile) {
        setMessage(result.error ?? "Your profile could not be updated.");
        return;
      }

      setName(result.profile.name);
      setEmail(result.profile.email);
      setMessage("Your profile has been updated.");

      try {
        await update();
      } catch {
        setMessage("Your profile was saved, but your session could not be refreshed. Please sign in again.");
      }
    } catch {
      setMessage("We couldn't connect. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#123984]">
        {role === "provider" ? "Service provider" : "Customer"}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        Your profile
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Keep your account details up to date.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="profile-name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Full name
          </label>
          <input
            id="profile-name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#d95a00] focus:ring-4 focus:ring-[#d95a00]/10"
          />
        </div>
        <div>
          <label
            htmlFor="profile-email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email address
          </label>
          <input
            id="profile-email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#d95a00] focus:ring-4 focus:ring-[#d95a00]/10"
          />
          <p className="mt-2 text-xs text-slate-500">
            You’ll use this address the next time you sign in.
          </p>
        </div>

        {message && (
          <p
            role="status"
            className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900"
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-[#c2410c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9a3412] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </form>
    </section>
  );
}
