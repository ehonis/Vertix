import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function MobileOAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const provider = params.provider;
  const callbackUrl = params.callbackUrl || "vertixmobile://auth";

  if (!provider || (provider !== "google" && provider !== "github")) {
    redirect("/signin?error=invalid_provider");
  }

  // Get the base URL from headers
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const baseUrl = `${protocol}://${host}`;

  // Set up the callback URL for NextAuth
  const callbackUrlForNextAuth = new URL("/api/mobile-auth/callback", baseUrl);
  callbackUrlForNextAuth.searchParams.set("callbackUrl", callbackUrl);

  // Use NextAuth's signIn function - this will redirect to the OAuth provider
  await signIn(provider, {
    redirectTo: callbackUrlForNextAuth.toString(),
  });

  // This shouldn't be reached, but just in case
  return null;
}
