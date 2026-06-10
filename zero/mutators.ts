import {zql} from './schema';
import z from 'zod';
import {defineMutator, defineMutators} from '@rocicorp/zero';
import type {Context} from './auth';

export const mutatorValidators = {
  cart: {
    add: z.object({albumId: z.string(), addedAt: z.number()}),
    remove: z.object({albumId: z.string()}),
  },
} as const;

export const mutators = defineMutators({
  cart: {
    add: defineMutator(
      mutatorValidators.cart.add,
      async ({tx, ctx, args: {albumId, addedAt}}) => {
        const {userId, clientIP} = requireAuthContext(ctx);
        if (tx.location === 'server') {
          auditCartMutation({action: 'add', userId, clientIP});
        }
        await tx.mutate.cartItem.insert({
          userId,
          albumId,
          addedAt: tx.location === 'client' ? addedAt : Date.now(),
        });
      },
    ),

    remove: defineMutator(
      mutatorValidators.cart.remove,
      async ({tx, ctx, args: {albumId}}) => {
        const {userId, clientIP} = requireAuthContext(ctx);
        if (tx.location === 'server') {
          auditCartMutation({action: 'remove', userId, clientIP});
        }
        const cartItem = await tx.run(
          zql.cartItem.where('userId', userId).where('albumId', albumId).one(),
        );
        if (!cartItem) {
          return;
        }
        await tx.mutate.cartItem.delete({
          userId: cartItem.userId,
          albumId: cartItem.albumId,
        });
      },
    ),
  },
});

function requireAuthContext(ctx: Context): NonNullable<Context> {
  if (!ctx) {
    throw new Error('Not authenticated');
  }
  return ctx;
}

function auditCartMutation({
  action,
  userId,
  clientIP,
}: {
  action: 'add' | 'remove';
  userId: string;
  clientIP: string | undefined;
}) {
  console.info('cart mutation', {action, userId, clientIP});
}
