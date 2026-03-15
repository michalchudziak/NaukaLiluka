import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { authComponent } from './auth';
import { getCurrentUserByTokenIdentifier, requireCurrentUser } from './lib/current_user';
import { appUserValidator } from './validators';

export const current = query({
  args: {},
  returns: v.union(appUserValidator, v.null()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    return await getCurrentUserByTokenIdentifier(ctx, identity.tokenIdentifier);
  },
});

export const ensureCurrentUser = mutation({
  args: {},
  returns: appUserValidator,
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: 'UNAUTHENTICATED',
        message: 'You must be signed in to initialize the app user.',
      });
    }

    const authUser = await authComponent.getAuthUser(ctx);
    const email = identity.email ?? authUser.email;
    const normalizedName = authUser.name.trim();
    const profileName = normalizedName.length >= 2 ? normalizedName : undefined;

    if (!email) {
      throw new ConvexError({
        code: 'MISSING_EMAIL',
        message: 'Signed-in account is missing an email address.',
      });
    }

    const existing = await getCurrentUserByTokenIdentifier(ctx, identity.tokenIdentifier);

    if (existing) {
      const updates: { email?: string; name?: string } = {};

      if (existing.email !== email) {
        updates.email = email;
      }

      if (profileName && existing.name !== profileName) {
        updates.name = profileName;
      }

      if (updates.email || updates.name) {
        await ctx.db.patch(existing._id, updates);
      }

      return {
        ...existing,
        ...updates,
      };
    }

    const userId = await ctx.db.insert('users', {
      tokenIdentifier: identity.tokenIdentifier,
      email,
      ...(profileName ? { name: profileName } : {}),
      createdAt: Date.now(),
    });

    const created = await ctx.db.get(userId);

    if (!created) {
      throw new ConvexError({
        code: 'USER_CREATE_FAILED',
        message: 'Could not create the app user record.',
      });
    }

    return created;
  },
});

export const updateProfile = mutation({
  args: {
    name: v.string(),
  },
  returns: appUserValidator,
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const normalizedName = args.name.trim();

    if (normalizedName.length < 2) {
      throw new ConvexError({
        code: 'PROFILE_NAME_INVALID',
        message: 'Name must be at least 2 characters long.',
      });
    }

    if (user.name === normalizedName) {
      return {
        ...user,
        name: normalizedName,
      };
    }

    await ctx.db.patch(user._id, { name: normalizedName });

    return {
      ...user,
      name: normalizedName,
    };
  },
});
