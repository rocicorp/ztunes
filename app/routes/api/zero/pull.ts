import {json} from '@tanstack/react-start';
import {processQueries} from '@rocicorp/zero/server';
import {schema} from 'zero/schema';
import {createServerFileRoute} from '@tanstack/react-start/server';
import {getUserID} from './-auth';
import * as queries from 'zero/queries';

export const ServerRoute = createServerFileRoute('/api/zero/pull').methods({
  POST: async ({request}) => {
    const userID = await getUserID(request);
    if (typeof userID === 'object') {
      return userID;
    }

    const result = await processQueries(
      async (name, args) => {
        const q = queries[name](...args);
        return {query: q};
      },
      schema,
      request,
    );

    return json(result);
  },
});
