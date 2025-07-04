import {namedQuery, Schema, Zero} from '@rocicorp/zero';
import {builder} from './schema';

export const topArtists = namedQuery('topArtists', () =>
  builder.artist.orderBy('popularity', 'desc').limit(1_000),
);

export const getArtist = namedQuery('getArtist', (artistID: string) =>
  builder.artist
    .where('id', artistID)
    .related('albums', album => album.related('cartItems'))
    .one(),
);

export const searchArtists = namedQuery('searchArtists', (q: string) => {
  let query = builder.artist.orderBy('popularity', 'desc').limit(20);
  if (q) {
    query = query.where('name', 'ILIKE', `%${q}%`);
  }
  return query;
});

export const getCartItems = namedQuery('getCartItems', (userID: string) =>
  builder.cartItem
    .where('userId', userID)
    .related('album', album => album.related('artist', artist => artist.one())),
);
