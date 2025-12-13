import {defineQueries, defineQuery, Query} from '@rocicorp/zero';
import {builder} from './schema';
import z from 'zod';
import {Context} from './auth';

export const queries = defineQueries({
  user: defineQuery(({ctx}) =>
    builder.user.where('id', ctx?.userId ?? '').one(),
  ),

  artistPreload: defineQuery(() =>
    builder.artist.orderBy('popularity', 'desc').limit(1_000),
  ),

  getHomepageArtists: defineQuery(
    z.object({q: z.string().optional()}),
    ({args: {q}}) =>
      builder.artist
        .where('name', 'ILIKE', `%${q ?? ''}%`)
        .orderBy('popularity', 'desc')
        .limit(20),
  ),

  getCartItems: defineQuery(({ctx}) =>
    authedCartItems(builder.cartItem, ctx).related('album', album =>
      album.one().related('artist', artist => artist.one()),
    ),
  ),

  getArtist: defineQuery(
    z.object({artistId: z.string().optional()}),
    ({ctx, args: {artistId}}) =>
      builder.artist
        .where('id', artistId ?? '')
        .related('albums', album =>
          album.related('cartItems', cartItem =>
            authedCartItems(cartItem, ctx),
          ),
        )
        .one(),
  ),
});

function authedCartItems(q: Query<'cartItem'>, ctx: Context) {
  return q.where('userId', ctx?.userId ?? '');
}
