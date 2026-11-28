"use client";

import { useEffect, useState, type FormEvent } from "react";

type BookingView = {
  bookingId: string;

  customerName: string;
  requestedDate: string;

  serviceId: string;
  title: string;
  description: string;
  category: string;

  status: string;
};

export function BookingsManager() {
  const [bookings, setBookings] = useState<BookingView[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadBookings() {
    try {
      const response = await fetch("/api/bookings?mine=true");
      const result = (await response.json()) as {
        error?: string;
        bookings?: BookingView[];
      };
      if (!response.ok || !result.bookings) {
        setMessage(result.error ?? "Your bookings could not be loaded.");
        return;
      }
      setBookings(result.bookings);
    } catch {
      setMessage("We couldn't connect to load your bookings.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function loadInitialBookings() {
      try {
        const response = await fetch("/api/bookings?mine=true");
        const result = (await response.json()) as {
          error?: string;
          bookings?: BookingView[];
        };
        if (!response.ok || !result.bookings) {
          setMessage(result.error ?? "Your bookings could not be loaded.");
          return;
        }
        setBookings(result.bookings);
      } catch {
        setMessage("We couldn't connect to load your bookings.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadInitialBookings();
  }, []);

  async function handleReject(id: string) {
    setMessage("");

    try {
      const response = await fetch(`/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(result.error ?? "This booking could not be updated.");
        return;
      }

      setMessage("Booking updated.");
      await loadBookings();
    } catch {
      setMessage("We couldn't connect. Please try again in a moment.");
    }
  }

  async function handleAccept(id: string) {
    setMessage("");

    try {
      const response = await fetch(`/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "accepted",
        }),
      });

      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setMessage(result.error ?? "This booking could not be updated.");
        return;
      }

      setMessage("Booking accepted.");

      await loadBookings();
    } catch {
      setMessage("We couldn't connect. Please try again in a moment.");
    }
  }

  return (
    <div className="flex flex-col mt-10">
      <section>
        <h2 className="text-xl font-semibold text-slate-900">
          Bookings on your listings
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Accept or reject bookings requested for your services.
        </p>
        <div className="my-5">
          {message && (
            <p
              role="status"
              className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-900"
            >
              {message}
            </p>
          )}
        </div>
        {isLoading ? (
          <p className="mt-6 text-sm text-slate-500">Loading your bookings</p>
        ) : bookings.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
            You haven’t received any bookings yet.
          </p>
        ) : (
          <ul className="mt-5 space-y-4 grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-5">
            {bookings.map((booking) => (
              <li
                key={booking.bookingId}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[#123984]">
                  {booking.category}
                </span>

                <h3 className="mt-3 text-2xl font-semibold text-slate-900">
                  {booking.title} - {booking.status}
                </h3>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#123984]"></p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {booking.description}
                </p>

                <div className="border-t border-slate-300 my-5"></div>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  Requested by:
                  <b> {booking.customerName} </b> - {booking.requestedDate}
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleAccept(booking.bookingId)}
                    className="rounded-lg border border-green-300 px-3 py-2 text-sm font-medium text-green-900 hover:bg-green-100"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(booking.bookingId)}
                    className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                  >
                    Reject
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
