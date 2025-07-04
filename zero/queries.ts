import {namedQuery} from '@rocicorp/zero';
import {builder} from './schema';

export type Auth = {
  userID: string;
};

function withAuth<T extends (...args: any[]) => any>(fn: T, auth: Auth) {
  return fn(auth.userID);
}

export const getArtist = namedQuery('getArtist', (artistID: string) =>
  builder.artist
    .where('id', artistID)
    .related('albums', album => album.related('cartItems'))
    .one(),
);

export const getCartItems = namedQuery('getCartItems', (userID: string) =>
  builder.cartItem
    .where('userId', userID)
    .related('album', album => album.related('artist', artist => artist.one())),
);
