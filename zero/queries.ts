import {defineQueries, defineQuery, Query} from '@rocicorp/zero';
import {zql} from './schema';
import z from 'zod';
import {Context} from './auth';

export const startRowSchema = z.object({
  id: z.string(),
  popularity: z.number().nullable(),
});

export type StartRow = z.infer<typeof startRowSchema>;

export const queries = defineQueries({
  user: defineQuery(({ctx}) => zql.user.where('id', ctx?.userId ?? '').one()),

  artistPreload: defineQuery(() =>
    zql.artist.orderBy('popularity', 'desc').limit(1_000),
  ),

  getHomepageArtists: defineQuery(
    z.object({
      search: z.string().optional(),
      limit: z.number().default(20),
      start: startRowSchema.nullable().optional(),
      dir: z.enum(['forward', 'backward']).default('forward'),
    }),
    ({args: {search, limit, start, dir}}) => {
      let q = zql.artist
        .where('name', 'ILIKE', `%${search ?? ''}%`)
        .orderBy('popularity', dir === 'forward' ? 'desc' : 'asc')
        .limit(limit);
      if (start) {
        q = q.start(start);
      }
      return q;
    },
  ),

  getCartItems: defineQuery(({ctx}) =>
    authedCartItems(zql.cartItem, ctx).related('album', album =>
      album.one().related('artist', artist => artist.one()),
    ),
  ),

  getSingleArtist: defineQuery(
    z.object({artistId: z.string().optional()}),
    ({args: {artistId}}) => zql.artist.where('id', artistId ?? '').one(),
  ),

  getArtist: defineQuery(
    z.object({artistId: z.string().optional()}),
    ({ctx, args: {artistId}}) =>
      zql.artist
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
