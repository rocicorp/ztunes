import {named} from './named';
import {AnyQuery, ReadonlyJSONValue} from '@rocicorp/zero';

type Validator<T extends ReadonlyJSONValue[]> = (value: unknown) => T;

type SyncedQuery<Q extends AnyQuery> = ReturnType<typeof named> & {
  withValidation: (...args: ReadonlyJSONValue[]) => Q;
};

export function synced<Q extends AnyQuery, TArgs extends ReadonlyJSONValue[]>(
  name: string,
  validator: Validator<TArgs>,
  query: (...args: TArgs) => Q,
): SyncedQuery<Q> {
  const ret = named(name, query) as unknown as SyncedQuery<Q>;
  ret.withValidation = (...args: ReadonlyJSONValue[]) => {
    const parsed = validator(args);
    return ret(...parsed) as Q;
  };
  return ret;
}
