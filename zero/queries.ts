import {namedQuery} from '@rocicorp/zero';
import {builder} from './schema';

export const getArtist = namedQuery('getArtist', (id: string) =>
  builder.artist
    .where('id', id)
    .related('albums', album => album.related('cartItems'))
    .one(),
);
