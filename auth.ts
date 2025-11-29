import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      from: "no-reply@vertixclimb.com", // Use your verified domain
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add additional fields to the session object
      session.user.id = user.id; // Include user ID
      session.user.role = user.role; // Include admin flag
      session.user.username = user.username; // Include routeSetter flag
      // Include routeSetter flag
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle mobile auth callbacks
      if (url.includes("/api/mobile-auth/callback")) {
        return url;
      }
      // Default NextAuth redirect behavior
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
});
