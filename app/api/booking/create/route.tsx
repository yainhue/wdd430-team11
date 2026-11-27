import { MongoServerError } from "mongodb";
import { hash } from "bcryptjs";
import { mongoClient } from "@/lib/mongodb";

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

  const { customerId, providerId, serviceId } = input as Record<
    string,
    unknown
  >;

  //  VALIDATION DISABLED, PENDING.
  //   if (
  //     typeof name !== "string" ||
  //     name.trim().length < 2 ||
  //     name.trim().length > 80
  //   ) {
  //     return Response.json(
  //       { error: "Name must be between 2 and 80 characters." },
  //       { status: 400 },
  //     );
  //   }

  //   if (typeof email !== "string" || !emailPattern.test(email.trim())) {
  //     return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  //   }

  //   if (
  //     typeof password !== "string" ||
  //     password.length < 8 ||
  //     password.length > 128
  //   ) {
  //     return Response.json(
  //       { error: "Password must be between 8 and 128 characters." },
  //       { status: 400 },
  //     );
  //   }

  //   if (role !== "customer" && role !== "provider") {
  //     return Response.json(
  //       { error: "Choose customer or service provider." },
  //       { status: 400 },
  //     );
  //   }

  //   const normalizedEmail = email.trim().toLowerCase();
  //   const passwordHash = await hash(password, 12);

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
    // requested date & created date are the same?
    await bookings.insertOne({
      customerId: customerId,
      providerId: providerId,
      serviceId: serviceId,
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
