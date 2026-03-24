import type { UserIdentity } from "convex/server";
import { QueryCtx, MutationCtx } from "./_generated/server";

type AuthCtx = QueryCtx | MutationCtx;

export type NormalizedIdentity = {
  tokenIdentifier: string;
  subject: string;
  email: string | null;
  name: string | null;
  image: string | null;
};

export async function getAuthIdentity(ctx: AuthCtx): Promise<NormalizedIdentity | null> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  return normalizeIdentity(identity);
}

export async function requireAuthIdentity(ctx: AuthCtx): Promise<NormalizedIdentity> {
  const identity = await getAuthIdentity(ctx);

  if (!identity) {
    throw new Error("Unauthorized");
  }

  return identity;
}

function normalizeIdentity(identity: UserIdentity): NormalizedIdentity {
  const email = firstString(identity.email, identity.emailVerified);
  const name = firstString(identity.name, identity.nickname, identity.givenName);
  const image = firstString(identity.pictureUrl);

  return {
    tokenIdentifier: identity.tokenIdentifier,
    subject: identity.subject,
    email,
    name,
    image,
  };
}

function firstString(...values: Array<string | null | undefined | boolean>): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}
