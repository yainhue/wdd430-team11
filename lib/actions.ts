"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

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
      return;
      //   return result;
    } catch (error) {
      //   return Error;
      console.log(error);
      return;
    }
  }
}
