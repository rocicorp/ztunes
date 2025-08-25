import {
  queries,
  type AnyQuery,
  ReadonlyJSONValue,
  queriesWithContext,
} from '@rocicorp/zero';

// TODO: Export named from @rocicorp/zero
export const queryName = Symbol('queryName');

export function named<T extends (...args: ReadonlyJSONValue[]) => AnyQuery>(
  name: string,
  fn: T,
) {
  const q = (queries as any)({
    [name]: fn,
  });
  const r = q[name] as T;
  r[queryName] = name;
  return r;
}

export function namedWithContext<
  Context,
  T extends (ctx: Context, ...args: ReadonlyJSONValue[]) => AnyQuery,
>(name: string, fn: T) {
  const q = (queriesWithContext as any)({
    [name]: fn,
  });
  const r = q[name] as T;
  r[queryName] = name;
  return r;
}
