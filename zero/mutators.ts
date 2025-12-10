import {crud, zql} from './schema';
import z from 'zod';
import {defineMutator, defineMutators} from '@rocicorp/zero';

export const mutators = defineMutators({
  cart: {
    add: defineMutator(
      z.object({albumId: z.string(), addedAt: z.number()}),
      async ({tx, ctx, args: {albumId, addedAt}}) => {
        if (!ctx) {
          throw new Error('Not authenticated');
        }
        const {userId} = ctx;
        await tx.mutate(
          crud.cartItem.insert({
            userId,
            albumId,
            addedAt: tx.location === 'client' ? addedAt : Date.now(),
          }),
        );
      },
    ),

    remove: defineMutator(
      z.object({albumId: z.string()}),
      async ({tx, ctx, args: {albumId}}) => {
        if (!ctx) {
          throw new Error('Not authenticated');
        }
        const {userId} = ctx;
        const cartItem = await tx.run(
          zql.cartItem.where('userId', userId).where('albumId', albumId).one(),
        );
        if (!cartItem) {
          return;
        }
        await tx.mutate(
          crud.cartItem.delete({
            userId: cartItem.userId,
            albumId: cartItem.albumId,
          }),
        );
      },
    ),
  },
});
