import {createServerFileRoute} from '@tanstack/react-start/server';
import {auth} from 'auth/init';

export const ServerRoute = createServerFileRoute('/api/auth/$').methods({
  GET: ({request}) => {
    return auth.handler(request);
  },
  POST: ({request}) => {
    return auth.handler(request);
  },
});
