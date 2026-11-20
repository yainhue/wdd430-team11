import { auth } from "@/auth";
import { ProfileForm } from "@/app/components/profile-form";
import { SiteHeader } from "@/app/components/site-header";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-500">Loading your profile…</p>
        </main>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-start justify-center px-5 py-12 sm:px-8">
        <ProfileForm
          initialName={session.user.name ?? ""}
          initialEmail={session.user.email ?? ""}
          role={session.user.role}
        />
      </main>
    </>
  );
}
