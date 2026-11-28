export const instant = false;

import { auth } from "@/auth";
import { ListingsManager } from "@/app/components/listings-manager";
import { BookingsManager } from "@/app/components/bookings-manager";
import { SiteHeader } from "@/app/components/site-header";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
  }>;
}) {
  const params = await searchParams;
  const dashboardView = params.view ?? "listings";
  console.log(dashboardView);

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-500">Loading your dashboard…</p>
        </main>
      }
    >
      <DashboardContent dashboardView={dashboardView} />
    </Suspense>
  );
}

interface DashboardContentProps {
  dashboardView: string;
}

async function DashboardContent(dashboardView: DashboardContentProps) {
  const session = await auth();
  if (!session?.user) redirect("/");
  console.log(dashboardView.dashboardView);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#123984]">
          {session.user.role === "provider"
            ? "Provider workspace"
            : "Customer account"}
        </p>
        <div className="flex justify-between">
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
            Welcome{session.user.name ? `, ${session.user.name}` : ""}
          </h1>
          {session.user.role === "provider" ? (
            <Link
              href={
                dashboardView.dashboardView === "listings"
                  ? "/dashboard?view=bookings"
                  : "/dashboard?view=listings"
              }
              className="rounded-lg border border-green-300 px-3 py-2 text-sm font-medium text-green-900 hover:bg-green-100"
            >
              Toggle View
            </Link>
          ) : (
            <></>
          )}
        </div>
        <p className="mt-3 mb-8 text-sm leading-6 text-slate-600">
          {session.user.role === "provider"
            ? "Create and manage the services customers can find in the marketplace."
            : "Browse local services and keep your profile details up to date."}
        </p>
        {session.user.role === "provider" ? (
          dashboardView.dashboardView === "listings" ? (
            <ListingsManager />
          ) : (
            <BookingsManager />
          )
        ) : (
          <div>
            <Link
              href="/services"
              className="inline-flex rounded-xl bg-[#c2410c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9a3412]"
            >
              Browse services
            </Link>
            {/* disabled, need to make a separate costumer bookings manager */}
            {/* <BookingsManager /> */}
          </div>
        )}
      </main>
    </>
  );
}
