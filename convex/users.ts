import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { getAuthIdentity, requireAuthIdentity } from "./auth";
import { v } from "convex/values";

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

export const isUsernameAvailable = query({
  args: {
    username: v.string(),
    excludeUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", q => q.eq("username", args.username))
      .unique();

    if (!existing) {
      return true;
    }

    if (args.excludeUserId && existing._id === args.excludeUserId) {
      return true;
    }

    return false;
  },
});

export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.union(v.string(), v.null())),
    username: v.optional(v.union(v.string(), v.null())),
    role: v.optional(v.union(v.literal("ADMIN"), v.literal("ROUTE_SETTER"), v.literal("USER"))),
    private: v.optional(v.boolean()),
    isOnboarded: v.optional(v.boolean()),
    image: v.optional(v.union(v.string(), v.null())),
    phoneNumber: v.optional(v.union(v.string(), v.null())),
    email: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const patch: Partial<Omit<AppUser, "_id" | "_creationTime">> = {};

    if (args.name !== undefined) patch.name = args.name ?? undefined;
    if (args.username !== undefined) patch.username = args.username ?? undefined;
    if (args.role !== undefined) patch.role = args.role;
    if (args.private !== undefined) patch.private = args.private;
    if (args.isOnboarded !== undefined) patch.isOnboarded = args.isOnboarded;
    if (args.image !== undefined) patch.image = args.image ?? undefined;
    if (args.phoneNumber !== undefined) patch.phoneNumber = args.phoneNumber ?? undefined;
    if (args.email !== undefined && args.email) patch.email = args.email;

    await ctx.db.patch(args.userId, patch);
    return await ctx.db.get(args.userId);
  },
});

export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", q => q.eq("username", args.username))
      .unique();
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const searchUsers = query({
  args: {
    search: v.string(),
    take: v.number(),
  },
  handler: async (ctx, args) => {
    const term = args.search.toLowerCase();
    const users = await ctx.db.query("users").take(10000);
    return users
      .filter(user => {
        const name = user.name?.toLowerCase() ?? "";
        const username = user.username?.toLowerCase() ?? "";
        return name.includes(term) || username.includes(term);
      })
      .slice(0, args.take);
  },
});

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
    return { ok: true };
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .unique();
  },
});

export const getUserByPhoneNumber = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").take(10000);
    return users.find(user => user.phoneNumber === args.phoneNumber) ?? null;
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
