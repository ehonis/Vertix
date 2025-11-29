import { initiateOAuth } from "./actions";
import { redirect } from "next/navigation";

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

  // Use Server Action to initiate OAuth (allows cookie modification)
  await initiateOAuth(provider, callbackUrl);

  // This shouldn't be reached, but just in case
  return null;
}
