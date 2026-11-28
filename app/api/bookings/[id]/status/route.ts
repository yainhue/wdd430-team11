import { auth } from "@/auth";
import { mongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/bookings/[id]/status">,
) {
  const session = await auth();

  if (!session?.user) {
    return Response.json(
      {
        error: "Please sign in to update this booking.",
      },
      {
        status: 401,
      },
    );
  }

  if (session.user.role !== "provider") {
    return Response.json(
      {
        error: "Only providers can update bookings.",
      },
      {
        status: 403,
      },
    );
  }

  const { id } = await context.params;

  if (!ObjectId.isValid(id)) {
    return Response.json(
      {
        error: "Booking not found.",
      },
      {
        status: 404,
      },
    );
  }

  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return Response.json(
      {
        error: "Please submit valid booking details.",
      },
      {
        status: 400,
      },
    );
  }

  if (typeof input !== "object" || input === null) {
    return Response.json(
      {
        error: "Please submit valid booking details.",
      },
      {
        status: 400,
      },
    );
  }

  const { status } = input as {
    status: string;
  };

  const validStatuses = ["pending", "accepted", "rejected", "completed"];

  if (!validStatuses.includes(status)) {
    return Response.json(
      {
        error: "Invalid booking status.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const bookings = mongoClient.db().collection("bookings");

    const result = await bookings.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return Response.json(
        {
          error: "Booking not found.",
        },
        {
          status: 404,
        },
      );
    }

    return Response.json({
      message: "Booking updated successfully.",
    });
  } catch (error) {
    console.error("Failed to update booking.", error);

    return Response.json(
      {
        error: "The booking could not be updated right now.",
      },
      {
        status: 500,
      },
    );
  }
}
