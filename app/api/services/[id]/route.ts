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

export async function GET(
  _request: Request,
  context: RouteContext<"/api/services/[id]">,
) {
  const { id } = await context.params;
  if (!ObjectId.isValid(id)) {
    return Response.json(
      { error: "Service listing not found." },
      { status: 404 },
    );
  }

  try {
    const service = await mongoClient
      .db()
      .collection<ServiceDocument>("services")
      .findOne({ _id: new ObjectId(id), status: "active" });

    if (!service) {
      return Response.json(
        { error: "Service listing not found." },
        { status: 404 },
      );
    }

    const provider = await mongoClient
      .db()
      .collection<{ name: string }>("users")
      .findOne({ _id: service.providerId }, { projection: { name: 1 } });

    return Response.json({
      service: {
        id: service._id.toString(),
        providerId: service.providerId.toString(),
        providerName: provider?.name ?? "Local provider",
        title: service.title,
        description: service.description,
        category: service.category,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to load SkillLink service listing.", error);
    return Response.json(
      { error: "This service listing is temporarily unavailable." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/services/[id]">,
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json(
      { error: "Please sign in to update this listing." },
      { status: 401 },
    );
  }
  if (session.user.role !== "provider") {
    return Response.json(
      { error: "Only providers can update service listings." },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  if (!ObjectId.isValid(id) || !ObjectId.isValid(session.user.id)) {
    return Response.json(
      { error: "Service listing not found." },
      { status: 404 },
    );
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json(
      { error: "Please submit valid service details." },
      { status: 400 },
    );
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

  try {
    const collection = mongoClient.db().collection<ServiceDocument>("services");
    const result = await collection.updateOne(
      {
        _id: new ObjectId(id),
        providerId: new ObjectId(session.user.id),
      },
      { $set: { ...service, updatedAt: new Date() } },
    );

    if (result.matchedCount === 0) {
      return Response.json(
        { error: "Service listing not found." },
        { status: 404 },
      );
    }

    return Response.json({ message: "Service listing updated." });
  } catch (error) {
    console.error("Failed to update SkillLink service listing.", error);
    return Response.json(
      { error: "The service listing could not be updated right now." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/services/[id]">,
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json(
      { error: "Please sign in to delete this listing." },
      { status: 401 },
    );
  }
  if (session.user.role !== "provider") {
    return Response.json(
      { error: "Only providers can delete service listings." },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  if (!ObjectId.isValid(id) || !ObjectId.isValid(session.user.id)) {
    return Response.json(
      { error: "Service listing not found." },
      { status: 404 },
    );
  }

  try {
    const result = await mongoClient
      .db()
      .collection<ServiceDocument>("services")
      .deleteOne({
        _id: new ObjectId(id),
        providerId: new ObjectId(session.user.id),
      });

    if (result.deletedCount === 0) {
      return Response.json(
        { error: "Service listing not found." },
        { status: 404 },
      );
    }

    return Response.json({ message: "Service listing deleted." });
  } catch (error) {
    console.error("Failed to delete SkillLink service listing.", error);
    return Response.json(
      { error: "The service listing could not be deleted right now." },
      { status: 500 },
    );
  }
}
