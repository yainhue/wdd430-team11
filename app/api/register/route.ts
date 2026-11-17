import { MongoServerError } from "mongodb";
import { hash } from "bcryptjs";
import { mongoClient } from "@/lib/mongodb";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Please submit valid account details." }, { status: 400 });
  }

  if (typeof input !== "object" || input === null) {
    return Response.json({ error: "Please submit valid account details." }, { status: 400 });
  }

  const { name, email, password, role } = input as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 80
  ) {
    return Response.json(
      { error: "Name must be between 2 and 80 characters." },
      { status: 400 },
    );
  }

  if (typeof email !== "string" || !emailPattern.test(email.trim())) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128
  ) {
    return Response.json(
      { error: "Password must be between 8 and 128 characters." },
      { status: 400 },
    );
  }

  if (role !== "customer" && role !== "provider") {
    return Response.json(
      { error: "Choose customer or service provider." },
      { status: 400 },
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await hash(password, 12);

  try {
    const users = mongoClient.db().collection("users");
    await users.createIndex({ email: 1 }, { unique: true });
    await users.insertOne({
      name: name.trim(),
      email: normalizedEmail,
      emailVerified: null,
      image: null,
      passwordHash,
      role,
      createdAt: new Date(),
    });

    return Response.json({ message: "Account created." }, { status: 201 });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return Response.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    console.error("Failed to register SkillLink account.", error);
    return Response.json(
      { error: "Account registration is temporarily unavailable." },
      { status: 500 },
    );
  }
}
