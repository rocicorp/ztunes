import {createServerFileRoute} from '@tanstack/react-start/server';
import {json} from '@tanstack/react-start';
import {processQueries} from '@rocicorp/zero/server';
import {getUserID} from './auth';
import {schema} from 'zero/schema.gen';
import {AnyQuery, ReadonlyJSONValue} from '@rocicorp/zero';
import {
  artistListQuery,
  artistQuery,
  cartItemListQuery,
  queryBuilder,
} from 'zero/queries';

type ServerContext = {
  userID?: string | undefined;
};

type ServerQuery = (
  context: ServerContext,
  args: readonly ReadonlyJSONValue[],
) => AnyQuery;

export const ServerRoute = createServerFileRoute('/api/zero/pull').methods({
  POST: async ({request}) => {
    const userID = await getUserID(request);
    if (typeof userID === 'object') {
      return userID;
    }

    return json(
      await processQueries(
        async (name, args) => ({query: getQuery({userID}, name, args)}),
        schema,
        request,
      ),
    );
  },
});

export function getQuery(
  serverContext: ServerContext,
  name: string,
  args: readonly ReadonlyJSONValue[],
): AnyQuery {
  const boundQuery = queries[name]?.(serverContext, args);
  if (boundQuery) {
    return boundQuery;
  }
  throw new Error(`Unknown query: ${name}`);
}

const queries: Record<string, ServerQuery> = {
  // I want to be able to do [artistQuery.name]: ...
  ['artist']: (_, args) => artistQuery(args[0] as string),
  ['artistList']: (_, args) =>
    artistListQuery(args[0] as number, (args[1] as string) || null),
  ['cartItemList']: ({userID}: ServerContext) => {
    if (!userID) {
      return queryBuilder.cartItem.where(({or}) => or());
    }
    return cartItemListQuery().where('userId', userID);
  },
};
