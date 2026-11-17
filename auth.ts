import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { ObjectId } from "mongodb";
import { mongoClient } from "@/lib/mongodb";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: MongoDBAdapter(mongoClient),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        const user = await mongoClient
          .db()
          .collection<{
            name: string;
            email: string;
            passwordHash: string;
            role: "customer" | "provider";
          }>("users")
          .findOne({ email: credentials.email.trim().toLowerCase() });

        if (
          !user ||
          !(user._id instanceof ObjectId) ||
          (user.role !== "customer" && user.role !== "provider") ||
          !(await compare(credentials.password, user.passwordHash))
        ) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (
        !session.user ||
        !token.sub ||
        (token.role !== "customer" && token.role !== "provider")
      ) {
        throw new Error("The authenticated session is missing valid account details.");
      }

      session.user.id = token.sub;
      session.user.role = token.role;
      return session;
    },
  },
});
