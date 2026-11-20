"use client";

import { useEffect, useState, type FormEvent } from "react";

type Service = {
  id: string;
  title: string;
  description: string;
  category: string;
};

type ServiceInput = Omit<Service, "id">;

const emptyService: ServiceInput = {
  title: "",
  description: "",
  category: "",
};

export function ListingsManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<ServiceInput>(emptyService);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadServices() {
    try {
      const response = await fetch("/api/services?mine=true");
      const result = (await response.json()) as {
        error?: string;
        services?: Service[];
      };
      if (!response.ok || !result.services) {
        setMessage(result.error ?? "Your listings could not be loaded.");
        return;
      }
      setServices(result.services);
    } catch {
      setMessage("We couldn't connect to load your listings.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function loadInitialServices() {
      try {
        const response = await fetch("/api/services?mine=true");
        const result = (await response.json()) as {
          error?: string;
          services?: Service[];
        };
        if (!response.ok || !result.services) {
          setMessage(result.error ?? "Your listings could not be loaded.");
          return;
        }
        setServices(result.services);
      } catch {
        setMessage("We couldn't connect to load your listings.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadInitialServices();
  }, []);

  function startEditing(service: Service) {
    setEditingId(service.id);
    setForm({
      title: service.title,
      description: service.description,
      category: service.category,
    });
    setMessage("");
  }

  function cancelEditing() {
    setEditingId(null);
    setForm(emptyService);
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        editingId ? `/api/services/${editingId}` : "/api/services",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(result.error ?? "The listing could not be saved.");
        return;
      }

      setMessage(editingId ? "Listing updated." : "Listing created.");
      setEditingId(null);
      setForm(emptyService);
      await loadServices();
    } catch {
      setMessage("We couldn't connect. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setMessage("");
    try {
      const response = await fetch(`/api/services/${id}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(result.error ?? "The listing could not be deleted.");
        return;
      }

      setServices((current) => current.filter((service) => service.id !== id));
      if (editingId === id) cancelEditing();
      setMessage("Listing deleted.");
    } catch {
      setMessage("We couldn't connect. Please try again in a moment.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">
          {editingId ? "Update service" : "Create a service listing"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Help customers understand what you offer.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="service-title" className="mb-2 block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              id="service-title"
              required
              minLength={3}
              maxLength={100}
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="e.g. Home cleaning"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#d95a00] focus:ring-4 focus:ring-[#d95a00]/10"
            />
          </div>
          <div>
            <label htmlFor="service-category" className="mb-2 block text-sm font-medium text-slate-700">
              Category
            </label>
            <input
              id="service-category"
              required
              minLength={2}
              maxLength={50}
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              placeholder="e.g. Cleaning"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#d95a00] focus:ring-4 focus:ring-[#d95a00]/10"
            />
          </div>
          <div>
            <label htmlFor="service-description" className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="service-description"
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Describe the service you provide"
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#d95a00] focus:ring-4 focus:ring-[#d95a00]/10"
            />
          </div>
          {message && (
            <p role="status" className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
              {message}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#c2410c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9a3412] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving…" : editingId ? "Save changes" : "Publish listing"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">Your listings</h2>
        <p className="mt-2 text-sm text-slate-500">
          Manage the services customers can discover.
        </p>
        {isLoading ? (
          <p className="mt-6 text-sm text-slate-500">Loading your listings…</p>
        ) : services.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
            You haven’t created a service listing yet.
          </p>
        ) : (
          <ul className="mt-5 space-y-4">
            {services.map((service) => (
              <li key={service.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#123984]">
                  {service.category}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{service.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {service.description}
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => startEditing(service)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(service.id)}
                    className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
