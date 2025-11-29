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
      // After OAuth callback, check if we have a mobile callback cookie
      // If so, redirect to mobile callback endpoint
      // The mobile callback will read the cookie and create JWT token
      
      // Default NextAuth redirect behavior first
      let redirectUrl: string;
      if (url.startsWith("/")) {
        redirectUrl = `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        redirectUrl = url;
      } else {
        redirectUrl = baseUrl;
      }
      
      // If this is coming from OAuth callback, check for mobile auth
      // We'll redirect to mobile callback which will check cookies
      if (url.includes("/api/auth/callback/")) {
        // Extract provider from callback URL
        const providerMatch = url.match(/\/api\/auth\/callback\/(google|github)/);
        if (providerMatch) {
          const provider = providerMatch[1];
          const mobileCallbackUrl = new URL("/api/mobile-auth/callback", baseUrl);
          mobileCallbackUrl.searchParams.set("provider", provider);
          return mobileCallbackUrl.toString();
        }
      }
      
      // Handle mobile auth callbacks (direct)
      if (url.includes("/api/mobile-auth/callback")) {
        return url;
      }
      
      return redirectUrl;
    },
  },
});
