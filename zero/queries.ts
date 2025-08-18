import {queries, queriesWithContext} from '@rocicorp/zero';
import {artistPage} from 'app/routes/_layout/artist';
import {cartPage} from 'app/routes/_layout/cart';
//import {indexPage} from 'app/routes/_layout';
import {cartComponent} from 'app/components/cart';
import {preload} from 'app/components/zero-init';

export const anon = queries({
  //indexPage,
  artistPage,
  preload,
});

export const authed = queriesWithContext({
  cartComponent,
  cartPage,
});
