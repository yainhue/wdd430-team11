"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { mongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export type State = {
  errors?: {};
  message?: string | null;
};

// begin helper functions:

export async function createBooking(
  customerId: string,
  providerId: string,
  serviceId: string,
) {
  // before doing anything, if the user is not logged in,
  // redirect them to the homepage and have them log in/register.
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  // if the user IS logged in, then proceed with booking creation:
  {
    try {
      // build an absolute URL, since we are calling the API directly
      const host = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

      const response = await fetch(`${host}/api/bookings/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId,
          providerId: providerId,
          serviceId: serviceId,
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "We couldn't create your account.");
      }

      // turned this function into void, since it was returning something and a form action that
      // is not void is not accepted.
      console.log("Booking created succesfuly.");
      revalidatePath(`/services/${serviceId}`);
      redirect(`/services/${serviceId}`);
      return;
      //   return result;
    } catch (error) {
      //   return Error;
      console.log(error);
      return;
    }
  }
}

export async function cancelBooking(
  bookingId: string | Promise<string>,
  serviceId: string,
) {
  // before doing anything, if the user is not logged in,
  // redirect them to the homepage and have them log in/register.
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  // if the user IS logged in, then proceed with booking cancelation:
  try {
    // build an absolute URL, since we are calling the API directly
    const host = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    console.log("ESTA ES LA URL");
    console.log(`> > > > >    ${host}/api/bookings/${bookingId}/cancel`);

    const response = await fetch(`${host}/api/bookings/${bookingId}/cancel`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      throw new Error(result.error ?? "We couldn't cancel your booking.");
    }

    // turned this function into void, since it was returning something and a form action that
    // is not void is not accepted.
    console.log("Booking canceled succesfuly.");
    revalidatePath(`/services/${serviceId}`);
    redirect(`/services/${serviceId}`);
    return;
    //   return result;
  } catch (error) {
    //   return Error;
    console.log(error);
    return;
  }
}

export async function findBookingId(
  customerId: string,
  providerId: string,
  serviceId: string,
) {
  // before doing anything, if the user is not logged in,
  // redirect them to the homepage and have them log in/register.
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  // if the user IS logged in, then proceed with booking location:

  {
    // find the booking id by finding a booking where the three Ids provided are present
    try {
      const bookings = mongoClient.db().collection("bookings");
      const booking = await bookings.findOne({
        customerId: new ObjectId(customerId),
        providerId: new ObjectId(providerId),
        serviceId: new ObjectId(serviceId),
      });

      //   If booking was found correctly...
      return String(booking?._id);

      //  if something goes wrong...
    } catch (error) {
      console.error("Failed to locate booking.", error);
    }
  }
}
