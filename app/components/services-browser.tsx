"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type Service = {
  id: string;
  providerName: string;
  title: string;
  description: string;
  category: string;
};

export function ServicesBrowser() {
  const [services, setServices] = useState<Service[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadServices() {
      try {
        const response = await fetch("/api/services");
        const result = (await response.json()) as {
          error?: string;
          services?: Service[];
        };
        if (!response.ok || !result.services) {
          setError(result.error ?? "Service listings could not be loaded.");
          return;
        }
        setServices(result.services);
      } catch {
        setError("We couldn't connect to load services. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadServices();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleServices = services.filter((service) =>
    [service.title, service.description, service.category, service.providerName]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery),
  );

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="service-search">
          Search services
        </label>
        <input
          id="service-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by service, category, or provider"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#d95a00] focus:ring-4 focus:ring-[#d95a00]/10"
        />
        <Link
          href="/dashboard"
          className="rounded-xl bg-[#c2410c] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#9a3412]"
        >
          Provider dashboard
        </Link>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error}
        </p>
      )}
      {isLoading ? (
        <p className="mt-10 text-sm text-slate-500">Loading services…</p>
      ) : !error && visibleServices.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          {services.length === 0
            ? "No services have been listed yet. Check back soon."
            : "No services match your search."}
        </p>
      ) : (
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {visibleServices.map((service) => (
            <Link href={`/services/${service.id}`} key={service.id}>
              <li className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-transform duration-500 hover:scale-102 hover:bg-blue-50 hover:cursor-pointer">
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#123984]">
                  {service.category}
                </span>
                <h2 className="mt-4 text-xl font-semibold text-slate-900">
                  {service.title}
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {service.description}
                </p>
                <p className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">
                  Offered by{" "}
                  <span className="font-medium text-slate-700">
                    {service.providerName}
                  </span>
                </p>
              </li>
            </Link>
          ))}
        </ul>
      )}
    </>
  );
}
