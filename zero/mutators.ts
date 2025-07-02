import {CustomMutatorDefs} from '@rocicorp/zero';
import {schema, AuthData} from './schema';

export function createMutators(authData: AuthData | undefined) {
  return {
    cart: {
      add: async (
        tx,
        {albumID, addedAt}: {albumID: string; addedAt: number},
      ) => {
        if (!authData) {
          throw new Error('Not authenticated');
        }
        try {
          await tx.mutate.cartItem.insert({
            userId: authData.sub,
            albumId: albumID,
            addedAt: tx.location === 'client' ? addedAt : Date.now(),
          });
        } catch (err) {
          console.error('error adding cart item', err);
          throw err;
        }
      },

      remove: async (tx, albumId: string) => {
        if (!authData) {
          throw new Error('Not authenticated');
        }
        const cartItem = await tx.query.cartItem
          .where('userId', authData.sub)
          .where('albumId', albumId)
          .one();
        if (!cartItem) {
          return;
        }
        await tx.mutate.cartItem.delete({
          userId: cartItem.userId,
          albumId: cartItem.albumId,
        });
      },
    },
  } as const satisfies CustomMutatorDefs<typeof schema>;
}

export type Mutators = ReturnType<typeof createMutators>;
