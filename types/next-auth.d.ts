import { DefaultUser } from "next-auth";
import { AdapterUser } from "@auth/core/adapters";
import type { UserRole } from "@/generated/prisma/client";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    username?: string;
    role: UserRole;
  }

  interface Session {
    user: User;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    username?: string;
    role: UserRole;
  }
}
