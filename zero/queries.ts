import {syncedQuery, syncedQueryWithContext} from '@rocicorp/zero';
import {builder} from './schema';
import z from 'zod';

export const queries = {
  user: syncedQueryWithContext(
    'user',
    z.tuple([]),
    (userID: string | undefined) =>
      builder.user.where('id', userID ?? '').one(),
  ),

  artistPreload: syncedQuery('artistPreload', z.tuple([]), () =>
    builder.artist.orderBy('popularity', 'desc').limit(1_000),
  ),

  getHomepageArtists: syncedQuery(
    'getHomepageArtists',
    z.tuple([z.string()]),
    (q: string) =>
      builder.artist
        .where('name', 'ILIKE', `%${q}%`)
        .orderBy('popularity', 'desc')
        .limit(20),
  ),

  getCartItems: syncedQueryWithContext(
    'getCartItems',
    z.tuple([]),
    (userID: string | undefined) =>
      builder.cartItem
        .related('album', album =>
          album.one().related('artist', artist => artist.one()),
        )
        .where('userId', userID ?? ''),
  ),

  getArtist: syncedQuery(
    'getArtist',
    z.tuple([z.string()]),
    (artistID: string) =>
      builder.artist
        .where('id', artistID)
        .related('albums', album => album.related('cartItems'))
        .one(),
  ),
};
