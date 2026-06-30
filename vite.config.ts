import {tanstackStart} from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import {nitro} from 'nitro/vite';
import {defineConfig} from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      srcDirectory: 'app',
      router: {
        routesDirectory: 'routes',
        generatedRouteTree: 'routeTree.gen.ts',
      },
      spa: {
        enabled: true,
      },
    }),
    nitro(),
    viteReact(),
  ],
});
