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
      // Check if this is a mobile auth callback
      // The mobileCallback param is passed through the NextAuth callback URL
      try {
        const urlObj = new URL(url, baseUrl);
        const mobileCallback = urlObj.searchParams.get("mobileCallback");
        
        if (mobileCallback) {
          // Decode and redirect to mobile callback
          const decodedCallback = decodeURIComponent(mobileCallback);
          const mobileCallbackUrl = new URL("/api/mobile-auth/callback", baseUrl);
          mobileCallbackUrl.searchParams.set("callbackUrl", decodedCallback);
          return mobileCallbackUrl.toString();
        }
      } catch (e) {
        // If URL parsing fails, continue with default behavior
      }
      
      // Handle mobile auth callbacks (direct)
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
