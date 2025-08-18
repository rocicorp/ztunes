import {json} from '@tanstack/react-start';
import type {AnyQuery, ReadonlyJSONValue} from '@rocicorp/zero';
import {anon} from 'zero/queries';
import {schema} from 'zero/schema';
import {createServerFileRoute} from '@tanstack/react-start/server';
import {getQueries} from '@rocicorp/zero/server';

export const ServerRoute = createServerFileRoute(
  '/api/zero/get-queries',
).methods({
  POST: async ({request}) => {
    return json(
      await getQueries(
        async (name, args) => ({
          query: getQuery(name, args),
        }),
        schema,
        request,
      ),
    );
  },
});

export function getQuery(name: string, args: readonly ReadonlyJSONValue[]) {
  const untyped = anon as Record<
    string,
    (...args: readonly ReadonlyJSONValue[]) => AnyQuery
  >;
  const mapper = untyped[name];

  if (name !== undefined) {
    return mapper(...args);
  } else {
    throw new Error(`Unknown query: ${name}`);
  }
}
