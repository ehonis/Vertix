import { DefaultUser } from "next-auth";
import { AdapterUser } from "@auth/prisma-adapter";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    username?: string;
    admin: boolean;
    routeSetter: boolean;
  }

  interface Session {
    user: User & {
      id: string;
      username?: string;
      admin: boolean;
      routeSetter: boolean;
    };
  }
}

declare module "@auth/prisma-adapter" {
  interface AdapterUser {
    username?: string;
    admin: boolean;
    routeSetter: boolean;
  }
} 