import {type AnyQuery, type ReadonlyJSONValue} from '@rocicorp/zero';
import {artistPage} from 'app/routes/_layout/artist';
import {cartPage} from 'app/routes/_layout/cart';
import {indexPage} from 'app/routes/_layout';
import {cartComponent} from 'app/components/cart';
import {preload} from 'app/components/zero-init';
import {must} from 'shared/must';
import {queryName} from './named';

export const anon = lookup(indexPage, artistPage, preload);
export const authed = lookup(cartComponent, cartPage);

// TODO: Maybe this could be an official concept in Zero?
type GetNamedQuery = (...args: Array<ReadonlyJSONValue>) => AnyQuery;

function lookup(...queries: GetNamedQuery[]) {
  const result: Record<string, GetNamedQuery> = {};
  for (const query of queries) {
    // TODO: We are mapping by name here, not QueryID. Is that a problem?
    const name = must(query[queryName]);
    if (name in result) {
      throw new Error(`Duplicate query name: ${name}`);
    }
    result[name] = query;
  }
  return result;
}
