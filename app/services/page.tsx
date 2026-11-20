import { SiteHeader } from "@/app/components/site-header";
import { ServicesBrowser } from "@/app/components/services-browser";

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#123984]">
          Local services
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
          Find help in your community
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Browse services offered by local providers. Search by service, category,
          or provider name.
        </p>
        <ServicesBrowser />
      </main>
    </>
  );
}
