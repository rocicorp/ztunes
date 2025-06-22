// vite.config.ts
import {defineConfig} from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import {tanstackStart} from '@tanstack/react-start/plugin/vite';
import {tanstackRouter} from '@tanstack/router-plugin/vite';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      target: 'vercel',
      tsr: {
        srcDirectory: 'app',
      },
      spa: {
        enabled: true,
      },
    }),
  ],
});
