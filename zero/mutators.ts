import { CustomMutatorDefs } from '@rocicorp/zero';
import { schema } from './schema';
import { AuthData } from './schema';
import { nanoid } from 'nanoid';

export function createMutators(authData: AuthData | undefined) {
  return {
    cart: {
      add: async (tx, { albumID, addedAt }: { albumID: string, addedAt: number }) => {
        if (!authData) {
          throw new Error('Not authenticated');
        }
        console.log('adding cart item', albumID, authData.sub, addedAt);
        try {
          console.log('foobar', await tx.query.album.limit(1));

          await tx.mutate.cartItem.insert({
            userId: authData.sub,
            albumId: albumID,
            addedAt: tx.location === 'client' ? addedAt : Date.now(),
          });
          console.log('cart item added', albumID, authData.sub, addedAt);
        } catch (err) {
          console.error('error adding cart item', err);
          throw err;
        }
      },

      remove: async (tx, { albumID }: { albumID: string }) => {
        if (!authData) {
          throw new Error('Not authenticated');
        }
        const cartItem = await tx.query.cartItem.where('userId', authData.sub).where('albumId', albumID).one();
        if (!cartItem) {
          return;
        }
        await tx.mutate.cartItem.delete({ userId: cartItem.userId, albumId: cartItem.albumId });
      },
    },
  } as const satisfies CustomMutatorDefs<typeof schema>;
}

export type Mutators = ReturnType<typeof createMutators>;