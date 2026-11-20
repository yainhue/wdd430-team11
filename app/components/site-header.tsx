import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8"
      >
        <Link href="/" className="text-lg font-bold tracking-tight text-[#123984]">
          SkillLink
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-sm font-medium text-slate-600">
          <Link className="transition hover:text-[#123984]" href="/services">
            Browse services
          </Link>
          <Link className="transition hover:text-[#123984]" href="/dashboard">
            Dashboard
          </Link>
          <Link className="transition hover:text-[#123984]" href="/profile">
            Profile
          </Link>
        </div>
      </nav>
    </header>
  );
}
