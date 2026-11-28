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

  //   confirm user is logged in
  if (mine) {
    const session = await auth();
    if (!session?.user) {
      return Response.json(
        { error: "Please sign in to view your bookings." },
        { status: 401 },
      );
    }

    // if user is a provider, return bookings where providerId matches the logged-in provider
    if (session.user.role === "provider") {
      providerId = new ObjectId(session.user.id);

      try {
        const bookingsCollection = mongoClient.db().collection("bookings");

        const bookings = await bookingsCollection
          .find({
            providerId,
          })
          .sort({
            createdAt: -1,
          })
          .limit(100)
          .toArray();

        const serviceIds = [
          ...new Set(bookings.map((booking) => booking.serviceId.toString())),
        ].map((id) => new ObjectId(id));

        const customerIds = [
          ...new Set(bookings.map((booking) => booking.customerId.toString())),
        ].map((id) => new ObjectId(id));

        const services = serviceIds.length
          ? await mongoClient
              .db()
              .collection<ServiceDocument>("services")
              .find({
                _id: {
                  $in: serviceIds,
                },
              })
              .toArray()
          : [];

        const customers = customerIds.length
          ? await mongoClient
              .db()
              .collection<{ name: string }>("users")
              .find(
                {
                  _id: {
                    $in: customerIds,
                  },
                },
                {
                  projection: {
                    name: 1,
                  },
                },
              )
              .toArray()
          : [];

        const servicesMap = new Map(
          services.map((service) => [service._id.toString(), service]),
        );

        const customerNames = new Map(
          customers.map((customer) => [customer._id.toString(), customer.name]),
        );

        return Response.json({
          bookings: bookings.map((booking) => {
            const service = servicesMap.get(booking.serviceId.toString());

            return {
              bookingId: booking._id.toString(),

              customerName:
                customerNames.get(booking.customerId.toString()) ??
                "Unknown Customer",

              requestedDate: booking.requestedDate.toISOString().split("T")[0],

              serviceId: booking.serviceId.toString(),

              title: service?.title ?? "Unknown Service",

              description: service?.description ?? "",

              category: service?.category ?? "",

              status: booking.status,
            };
          }),
        });
      } catch (error) {
        console.error("Failed to load provider bookings.", error);

        return Response.json(
          {
            error: "Provider bookings are temporarily unavailable.",
          },
          {
            status: 500,
          },
        );
      }
    }

    // if user is a customer, return bookings where customerId matches the logged-in customer
    if (session.user.role === "customer") {
      const customerId = new ObjectId(session.user.id);

      try {
        const bookingsCollection = mongoClient.db().collection("bookings");

        const bookings = await bookingsCollection
          .find({
            customerId,
          })
          .sort({
            createdAt: -1,
          })
          .limit(100)
          .toArray();

        const serviceIds = [
          ...new Set(bookings.map((booking) => booking.serviceId.toString())),
        ].map((id) => new ObjectId(id));

        const providerIds = [
          ...new Set(bookings.map((booking) => booking.providerId.toString())),
        ].map((id) => new ObjectId(id));

        const services = serviceIds.length
          ? await mongoClient
              .db()
              .collection<ServiceDocument>("services")
              .find({
                _id: {
                  $in: serviceIds,
                },
              })
              .toArray()
          : [];

        const providers = providerIds.length
          ? await mongoClient
              .db()
              .collection<{ name: string }>("users")
              .find(
                {
                  _id: {
                    $in: providerIds,
                  },
                },
                {
                  projection: {
                    name: 1,
                  },
                },
              )
              .toArray()
          : [];

        const servicesMap = new Map(
          services.map((service) => [service._id.toString(), service]),
        );

        const providerNames = new Map(
          providers.map((provider) => [provider._id.toString(), provider.name]),
        );

        return Response.json({
          bookings: bookings.map((booking) => {
            const service = servicesMap.get(booking.serviceId.toString());

            return {
              bookingId: booking._id.toString(),

              providerName:
                providerNames.get(booking.providerId.toString()) ??
                "Unknown Provider",

              requestedDate: booking.requestedDate.toISOString().split("T")[0],

              serviceId: booking.serviceId.toString(),

              title: service?.title ?? "Unknown Service",

              description: service?.description ?? "",

              category: service?.category ?? "",

              status: booking.status,
            };
          }),
        });
      } catch (error) {
        console.error("Failed to load customer bookings.", error);

        return Response.json(
          {
            error: "Customer bookings are temporarily unavailable.",
          },
          {
            status: 500,
          },
        );
      }
    }
  }
}
