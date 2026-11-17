import type { DefaultSession } from "next-auth";

type AccountRole = "customer" | "provider";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AccountRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: AccountRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AccountRole;
  }
}
