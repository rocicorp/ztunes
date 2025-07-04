import {escapeLike, namedQuery, querify, Query, type Row} from '@rocicorp/zero';
import {schema, type Schema} from './schema';

// const queryBuilder = makeQueryBuilder(schema);
export const queryBuilder = querify(schema);

function artistsWithAlbumsAndCartItems() {
  return queryBuilder.artist.related('albums', album =>
    album.related('cartItems', ci => ci.one()).orderBy('year', 'desc'),
  );
}

export const artistQuery = namedQuery('artist', (id: string) => {
  return artistsWithAlbumsAndCartItems().where('id', id).one();
});

export const artistListQuery = namedQuery(
  'artistList',
  (limit: number, search: string | null) => {
    let q = artistsWithAlbumsAndCartItems()
      .orderBy('popularity', 'desc')
      .limit(limit);
    if (search) {
      q = q.where('name', 'ILIKE', `%${search}%`);
    }
    return q;
  },
);

export const cartItemListQuery = namedQuery('cartItemList', () => {
  return queryBuilder.cartItem.related('album', album =>
    album.one().related('artist', artist => artist.one()),
  );
});
