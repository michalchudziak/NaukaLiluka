import { ConvexError } from 'convex/values';
import type { Doc } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';

type UserCtx = QueryCtx | MutationCtx;

export async function getCurrentUserByTokenIdentifier(
  ctx: UserCtx,
  tokenIdentifier: string
): Promise<Doc<'users'> | null> {
  return await ctx.db
    .query('users')
    .withIndex('by_token_identifier', (q) => q.eq('tokenIdentifier', tokenIdentifier))
    .first();
}

export async function requireCurrentUser(ctx: UserCtx): Promise<Doc<'users'>> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError({
      code: 'UNAUTHENTICATED',
      message: 'You must be signed in to access this data.',
    });
  }

  const user = await getCurrentUserByTokenIdentifier(ctx, identity.tokenIdentifier);

  if (!user) {
    throw new ConvexError({
      code: 'USER_NOT_INITIALIZED',
      message: 'App user has not been initialized yet.',
    });
  }

  return user;
}
