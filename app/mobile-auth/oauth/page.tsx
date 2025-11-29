import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

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

  // Store mobile callback URL in cookie
  const cookieStore = await cookies();
  cookieStore.set(`mobile_callback_${provider}`, callbackUrl, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  // Use NextAuth's signIn which handles PKCE properly
  // This will redirect to the OAuth provider
  await signIn(provider);

  // This shouldn't be reached, but just in case
  return null;
}
