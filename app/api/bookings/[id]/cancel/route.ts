import { mongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/services/[id]">,
) {
  const { id } = await context.params;
  if (!ObjectId.isValid(id)) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  // try {
  //   input = await request.json();
  // } catch {
  //   return Response.json(
  //     { error: "Please submit valid booking details." },
  //     { status: 400 },
  //   );
  // }

  // if (typeof input !== "object" || input === null) {
  //   return Response.json(
  //     { error: "Please submit valid booking details." },
  //     { status: 400 },
  //   );
  // }

  // const { customerId, providerId, serviceId } = input as {
  //   customerId: string;
  //   providerId: string;
  //   serviceId: string;
  // };

  //  VALIDATION PENDING.

  try {
    const bookings = mongoClient.db().collection("bookings");

    const result = await bookings.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return Response.json(
        {
          error: "Booking not found.",
        },
        {
          status: 404,
        },
      );
    }

    return Response.json(
      {
        message: "Booking cancelled.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Failed to cancel booking.", error);

    return Response.json(
      {
        error: "Booking cancellation is temporarily unavailable.",
      },
      {
        status: 500,
      },
    );
  }
}
