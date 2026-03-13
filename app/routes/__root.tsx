// app/routes/__root.tsx
import type {ReactNode} from 'react';
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import {must} from 'shared/must';
import type {RouterContext} from 'app/router';

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'ztunes',
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

const zeroCacheURL = must(
  import.meta.env.VITE_PUBLIC_ZERO_CACHE_URL,
  'VITE_PUBLIC_ZERO_CACHE_URL is required',
);

function RootDocument({children}: Readonly<{children: ReactNode}>) {
  return (
    <html>
      <head>
        <link rel="preconnect" href={zeroCacheURL} />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          html, body {
            height: 100%;
            margin: 0;
            font-family: sans-serif;
            font-optical-sizing: auto;
            font-weight: 400;
            font-style: normal;
          }
        `,
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
