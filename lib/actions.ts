export type State = {
  errors?: {};
  message?: string | null;
};

// begin helper functions:

interface createBookingProps {
  customerId: string;
  providerId: string;
  serviceId: string;
}

export async function createBooking({
  customerId,
  providerId,
  serviceId,
}: createBookingProps) {
  try {
    const response = await fetch("/api/bookings/create", {
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

    return result;
  } catch (error) {
    return Error;
  }
}
