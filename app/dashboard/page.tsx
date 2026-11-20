import { auth } from "@/auth";
import { ListingsManager } from "@/app/components/listings-manager";
import { SiteHeader } from "@/app/components/site-header";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-500">Loading your dashboard…</p>
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#123984]">
          {session.user.role === "provider" ? "Provider workspace" : "Customer account"}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
          Welcome{session.user.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="mt-3 mb-8 text-sm leading-6 text-slate-600">
          {session.user.role === "provider"
            ? "Create and manage the services customers can find in the marketplace."
            : "Browse local services and keep your profile details up to date."}
        </p>
        {session.user.role === "provider" ? (
          <ListingsManager />
        ) : (
          <Link
            href="/services"
            className="inline-flex rounded-xl bg-[#c2410c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9a3412]"
          >
            Browse services
          </Link>
        )}
      </main>
    </>
  );
}
