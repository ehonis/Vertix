import { ConvexHttpClient } from "convex/browser";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in your environment.");
}

export function createConvexServerClient(token?: string | null) {
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  if (token) {
    client.setAuth(token);
  }

  return client;
}
