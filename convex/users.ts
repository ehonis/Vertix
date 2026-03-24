import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { getAuthIdentity, requireAuthIdentity } from "./auth";

type AppUser = Doc<"users">;

export const getCurrent = query({
  args: {},
  handler: async (ctx): Promise<AppUser | null> => {
    const identity = await getAuthIdentity(ctx);

    if (!identity) {
      return null;
    }

    return await findUserByIdentity(
      ctx,
      identity.tokenIdentifier,
      identity.subject,
      identity.email
    );
  },
});

export const upsertCurrent = mutation({
  args: {},
  handler: async (ctx): Promise<AppUser> => {
    const identity = await requireAuthIdentity(ctx);
    const email = identity.email ?? buildFallbackEmail(identity.subject);

    let user = await findUserByIdentity(
      ctx,
      identity.tokenIdentifier,
      identity.subject,
      identity.email
    );

    if (user) {
      const patch: Partial<Omit<AppUser, "_id" | "_creationTime">> = {};

      if (user.clerkId !== identity.subject) {
        patch.clerkId = identity.subject;
      }

      if (user.clerkTokenIdentifier !== identity.tokenIdentifier) {
        patch.clerkTokenIdentifier = identity.tokenIdentifier;
      }

      if (identity.email && user.email !== identity.email) {
        patch.email = identity.email;
      }

      if (identity.name && user.name !== identity.name) {
        patch.name = identity.name;
      }

      if (identity.image && user.image !== identity.image) {
        patch.image = identity.image;
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(user._id, patch);
        const updatedUser = await ctx.db.get(user._id);

        if (!updatedUser) {
          throw new Error("Failed to load updated user");
        }

        return updatedUser;
      }

      return user;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      clerkTokenIdentifier: identity.tokenIdentifier,
      email,
      name: identity.name ?? undefined,
      image: identity.image ?? undefined,
      role: "USER",
      private: false,
      isOnboarded: false,
      totalXp: 0,
    });

    const createdUser = await ctx.db.get(userId);

    if (!createdUser) {
      throw new Error("Failed to load created user");
    }

    return createdUser;
  },
});

async function findUserByIdentity(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
  subject: string,
  email: string | null
): Promise<AppUser | null> {
  const byToken = await ctx.db
    .query("users")
    .withIndex("by_clerk_token_identifier", q => q.eq("clerkTokenIdentifier", tokenIdentifier))
    .unique();

  if (byToken) {
    return byToken;
  }

  const bySubject = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", q => q.eq("clerkId", subject))
    .unique();

  if (bySubject) {
    return bySubject;
  }

  if (!email) {
    return null;
  }

  return await ctx.db
    .query("users")
    .withIndex("by_email", q => q.eq("email", email))
    .unique();
}

function buildFallbackEmail(subject: string) {
  return `${subject}@clerk.local`;
}
