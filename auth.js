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
      session.user.admin = user.admin; // Include admin flag
      session.user.routeSetter = user.routeSetter; // Include routeSetter flag
      return session;
    },
    async signIn({ user }) {
      if (!user.username) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { username: user.id },
          });
        } catch (error) {
          console.error("Error updating username:", error);
          // Return false to reject the sign in, or handle as needed.
          return false;
        }
      }
      // Return true to allow sign in
      return true;
    },
  },
});
