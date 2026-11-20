import { auth } from "@/auth";
import { mongoClient } from "@/lib/mongodb";
import { MongoServerError, ObjectId } from "mongodb";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type UserProfile = {
  name: string;
  email: string;
  role: "customer" | "provider";
};

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Please sign in to view your profile." }, { status: 401 });
  }

  if (!ObjectId.isValid(session.user.id)) {
    return Response.json({ error: "Your session is invalid. Please sign in again." }, { status: 401 });
  }

  try {
    const profile = await mongoClient
      .db()
      .collection<UserProfile>("users")
      .findOne(
        { _id: new ObjectId(session.user.id) },
        { projection: { name: 1, email: 1, role: 1 } },
      );

    if (!profile) {
      return Response.json({ error: "This account could not be found." }, { status: 404 });
    }

    return Response.json({
      profile: {
        name: profile.name,
        email: profile.email,
        role: profile.role,
      },
    });
  } catch (error) {
    console.error("Failed to load SkillLink profile.", error);
    return Response.json(
      { error: "Your profile is temporarily unavailable." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Please sign in to update your profile." }, { status: 401 });
  }

  if (!ObjectId.isValid(session.user.id)) {
    return Response.json({ error: "Your session is invalid. Please sign in again." }, { status: 401 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Please submit valid profile details." }, { status: 400 });
  }

  if (typeof input !== "object" || input === null) {
    return Response.json({ error: "Please submit valid profile details." }, { status: 400 });
  }

  const { name, email } = input as Record<string, unknown>;
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

  if (
    typeof email !== "string" ||
    email.trim().length > 254 ||
    !emailPattern.test(email.trim())
  ) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const users = mongoClient.db().collection<UserProfile>("users");
    await users.createIndex({ email: 1 }, { unique: true });

    const result = await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          name: name.trim(),
          email: normalizedEmail,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "This account could not be found." }, { status: 404 });
    }

    const profile = await users.findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { name: 1, email: 1, role: 1 } },
    );

    if (!profile) {
      return Response.json({ error: "This account could not be found." }, { status: 404 });
    }

    return Response.json({
      message: "Profile updated.",
      profile: {
        name: profile.name,
        email: profile.email,
        role: profile.role,
      },
    });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return Response.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    console.error("Failed to update SkillLink profile.", error);
    return Response.json(
      { error: "Your profile could not be updated right now." },
      { status: 500 },
    );
  }
}
