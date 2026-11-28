import { mongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return Response.json(
      { error: "Please submit valid booking details." },
      { status: 400 },
    );
  }

  if (typeof input !== "object" || input === null) {
    return Response.json(
      { error: "Please submit valid booking details." },
      { status: 400 },
    );
  }

  const { customerId, providerId, serviceId } = input as {
    customerId: string;
    providerId: string;
    serviceId: string;
  };

  //  VALIDATION PENDING.

  try {
    const bookings = mongoClient.db().collection("bookings");
    await bookings.createIndex({
      customerId: 1,
    });
    await bookings.createIndex({
      providerId: 1,
    });
    await bookings.createIndex({
      serviceId: 1,
    });
    // create booking in the database using all of the IDs provided
    await bookings.insertOne({
      customerId: new ObjectId(customerId),
      providerId: new ObjectId(providerId),
      serviceId: new ObjectId(serviceId),
      requestedDate: new Date(),
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Response.json({ message: "Booking created." }, { status: 201 });
  } catch (error) {
    console.error("Failed to create the booking.", error);
    return Response.json(
      { error: "Service booking is temporarily unavailable." },
      { status: 500 },
    );
  }
}
