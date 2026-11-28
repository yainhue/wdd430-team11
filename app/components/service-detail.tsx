// "use server";

import {
  type State,
  createBooking,
  findBookingId,
  cancelBooking,
} from "@/lib/actions";
import { auth } from "@/auth";

interface MeetingDetailProps {
  id: string;
}

export async function ServiceDetail({ id }: MeetingDetailProps) {
  // let service: Service | null = null;

  // Fetch service with error handling
  try {
    // build an absolute URL, since we are calling the API directly
    const host = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const response = await fetch(`${host}/api/services/${id}`);

    const result = await response.json();

    // if something goes wrong...
    if (!response.ok || !result.service) {
      console.log(result.error ?? "Your listings could not be loaded.");

      // render a 404 not found error page
      return (
        <div className="min-h-screen bg-slate-50">
          <main className="mx-auto max-w-6xl px-6 py-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_320px] p-10 bg-gray-100 rounded-lg shadow-lg">
              {/* Main */}
              <section className="card">
                <h1 className="mt-3 text-4xl font-bold text-slate-900">
                  404 - Service listing not found
                </h1>

                <p className="mt-6 text-lg leading-8 text-slate-600 mb-10">
                  Please try again with a valid ID, or try again in a few
                  minutes.
                </p>

                <div className="mt-8 border-t border-slate-300 pt-6"></div>
              </section>
            </div>
          </main>
        </div>
      );
      // else, if everything is OK, render the service detail page...
    } else {
      const service = result.service;
      // initial state, function binding and useActionState
      const initialState: State = {
        message: null,
        errors: {},
      };

      let customerId;
      const session = await auth();
      if (!session?.user) {
        // if user is not logged in, set a fake Id. It won't affect the flow of the app,
        // since the helper "createBooking" checks to see if user is logged in before doing anything.
        customerId = "notLoggedIn";
      } else {
        customerId = session.user.id;
      }

      // check to see if the booking already exists in the DB
      const bookingId = await findBookingId(
        customerId,
        service.providerId,
        service.id,
      );

      return (
        // display service details + booking link
        // commented out some <p> that we are not using based on our system right now.
        <div className="min-h-screen bg-slate-50">
          <main className="mx-auto max-w-6xl px-6 py-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_320px] p-10 bg-gray-100 rounded-lg shadow-lg">
              {/* Main */}
              <section className="card">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#123984]">
                  {service?.category}
                </p>

                <h1 className="mt-3 text-4xl font-bold text-slate-900">
                  {service?.title}
                </h1>

                <p className="mt-6 text-lg leading-8 text-slate-600 mb-10">
                  {service?.description}
                </p>

                <div className="mt-8 border-t border-slate-300 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mt-5">
                    Service Provider
                  </h3>

                  <p className="mt-2 text-slate-700">{service?.providerName}</p>

                  {/* <p className="mt-1 text-slate-500">{service?.location}</p> */}
                </div>
              </section>

              {/* Sidebar */}
              <aside className="card h-fit flex flex-col gap-30 my-15">
                {/* <div className="text-center">
              <p className="text-sm text-slate-500">Starting at</p>

              <p className="mt-2 text-4xl font-bold text-[#123984]">
                ${service?.price}
              </p>
            </div> */}

                {/* conditional: if the booking already exists, show cancel booking button instead, else show create booking button*/}
                {bookingId != undefined && bookingId != "undefined" ? (
                  <form
                    action={cancelBooking.bind(null, bookingId, service.id)}
                    className="flex"
                  >
                    <button className="flex-1 rounded-xl bg-[#c2410c] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#9a3412] hover:cursor-pointer">
                      Cancel Booking
                    </button>
                  </form>
                ) : (
                  <form
                    action={createBooking.bind(
                      null,
                      customerId,
                      service.providerId,
                      service.id,
                    )}
                    className="flex"
                  >
                    <button className="flex-1 rounded-xl bg-[#c2410c] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#9a3412] hover:cursor-pointer">
                      Book Service
                    </button>
                  </form>
                )}

                <button className="rounded-xl bg-[#c2410c] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#9a3412] hover:cursor-pointer">
                  Contact Provider
                </button>
              </aside>
            </div>
          </main>
        </div>
      );
    }
  } catch (error) {
    console.error(error);
    return <p>An unexpected error occurred while loading the service.</p>;
  }
}
