import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { ConvexError, v } from 'convex/values';
import { authComponent } from './auth';
import { getCurrentUserByTokenIdentifier } from './lib/current_user';
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

    if (!email) {
      throw new ConvexError({
        code: 'MISSING_EMAIL',
        message: 'Signed-in account is missing an email address.',
      });
    }

    const existing = await getCurrentUserByTokenIdentifier(ctx, identity.tokenIdentifier);

    if (existing) {
      if (existing.email !== email) {
        await ctx.db.patch(existing._id, { email });
      }

      return {
        ...existing,
        email,
      };
    }

    const userId = await ctx.db.insert('users', {
      tokenIdentifier: identity.tokenIdentifier,
      email,
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
