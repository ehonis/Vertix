import { DefaultUser } from "next-auth";
import { AdapterUser } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    username?: string;
    role: UserRole;

  }

  interface Session {
    user: User & {
      id: string;
      username?: string;
      role: UserRole;
    };
  }
}

declare module "@auth/prisma-adapter" {
  interface AdapterUser {
    username?: string;
    role: UserRole;

  }
} 