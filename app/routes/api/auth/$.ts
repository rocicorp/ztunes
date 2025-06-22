import {createServerFileRoute} from '@tanstack/react-start/server';
import {auth} from 'auth/auth';

export const ServerRoute = createServerFileRoute('/api/auth/$').methods({
  GET: async ({request}) => {
    const response = await auth.handler(request);
    console.log('GET request url', request.url);
    console.log('headers', response.headers);
    return response;
  },
  POST: async ({request}) => {
    const response = await auth.handler(request);
    console.log('POST request url', request.url);
    console.log('headers', response.headers);
    return response;
  },
});
