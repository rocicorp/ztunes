// app/client.tsx
/// <reference types="vinxi/types/client" />
import {hydrateRoot} from 'react-dom/client';
import {StartClient} from '@tanstack/react-start';
import {createRouter} from './router';
import {Zero} from '@rocicorp/zero';
import {schema} from '../zero/schema';
import {ZeroProvider} from '@rocicorp/zero/react';

const router = createRouter();

const z = new Zero({
  userID: 'anon',
  server: import.meta.env.VITE_PUBLIC_SERVER,
  schema,
});

hydrateRoot(
  document,
  <ZeroProvider zero={z}>
    <StartClient router={router} />
  </ZeroProvider>,
);
