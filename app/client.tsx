// app/client.tsx
/// <reference types="vinxi/types/client" />
import {hydrateRoot} from 'react-dom/client';
import {StartClient} from '@tanstack/react-start';
import {createRouter} from './router';
import {ZeroProvider} from './components/zero-provider';

const router = createRouter();

hydrateRoot(
  document,
  <ZeroProvider>
    <StartClient router={router} />
  </ZeroProvider>,
);
