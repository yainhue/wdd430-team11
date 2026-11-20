import { auth } from "@/auth";
import { mongoClient } from "@/lib/mongodb";
import { parseServiceInput } from "@/lib/service-validation";
import { ObjectId } from "mongodb";

type ServiceDocument = {
  providerId: ObjectId;
  title: string;
  description: string;
  category: string;
  status: "active";
  createdAt: Date;
  updatedAt: Date;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mine = url.searchParams.get("mine") === "true";
  let providerId: ObjectId | undefined;

  if (mine) {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Please sign in to view your listings." }, { status: 401 });
    }
    if (session.user.role !== "provider") {
      return Response.json({ error: "Only providers can manage service listings." }, { status: 403 });
    }
    if (!ObjectId.isValid(session.user.id)) {
      return Response.json({ error: "Your session is invalid. Please sign in again." }, { status: 401 });
    }
    providerId = new ObjectId(session.user.id);
  }

  const collection = mongoClient.db().collection<ServiceDocument>("services");
  const filter = mine
    ? { providerId }
    : { status: "active" as const };

  try {
    const services = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    const providerIds = [...new Set(services.map((service) => service.providerId.toString()))]
      .map((id) => new ObjectId(id));
    const providers = providerIds.length
      ? await mongoClient
          .db()
          .collection<{ name: string }>("users")
          .find(
            { _id: { $in: providerIds } },
            { projection: { name: 1 } },
          )
          .toArray()
      : [];
    const providerNames = new Map(
      providers.map((provider) => [provider._id.toString(), provider.name]),
    );

    return Response.json({
      services: services.map((service) => ({
        id: service._id.toString(),
        providerId: service.providerId.toString(),
        providerName: providerNames.get(service.providerId.toString()) ?? "Local provider",
        title: service.title,
        description: service.description,
        category: service.category,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Failed to load SkillLink service listings.", error);
    return Response.json(
      { error: "Service listings are temporarily unavailable." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Please sign in to create a listing." }, { status: 401 });
  }
  if (session.user.role !== "provider") {
    return Response.json({ error: "Only providers can create service listings." }, { status: 403 });
  }
  if (!ObjectId.isValid(session.user.id)) {
    return Response.json({ error: "Your session is invalid. Please sign in again." }, { status: 401 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Please submit valid service details." }, { status: 400 });
  }

  const service = parseServiceInput(input);
  if (!service) {
    return Response.json(
      {
        error:
          "Enter a title (3–100 characters), description (10–2,000 characters), and category (2–50 characters).",
      },
      { status: 400 },
    );
  }

  const now = new Date();
  try {
    const result = await mongoClient
      .db()
      .collection<ServiceDocument>("services")
      .insertOne({
        ...service,
        providerId: new ObjectId(session.user.id),
        status: "active",
        createdAt: now,
        updatedAt: now,
      });

    return Response.json(
      { id: result.insertedId.toString(), message: "Service listing created." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create SkillLink service listing.", error);
    return Response.json(
      { error: "The service listing could not be created right now." },
      { status: 500 },
    );
  }
}
