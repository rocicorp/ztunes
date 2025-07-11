/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createServerRootRoute } from '@tanstack/react-start/server'

import { Route as rootRouteImport } from './routes/__root'
import { Route as LayoutRouteRouteImport } from './routes/_layout/route'
import { Route as LayoutIndexRouteImport } from './routes/_layout/index'
import { Route as LayoutCartRouteImport } from './routes/_layout/cart'
import { Route as LayoutArtistRouteImport } from './routes/_layout/artist'
import { ServerRoute as ApiZeroPushServerRouteImport } from './routes/api/zero/push'
import { ServerRoute as ApiAuthRefreshServerRouteImport } from './routes/api/auth/refresh'
import { ServerRoute as ApiAuthSplatServerRouteImport } from './routes/api/auth/$'

const rootServerRouteImport = createServerRootRoute()

const LayoutRouteRoute = LayoutRouteRouteImport.update({
  id: '/_layout',
  getParentRoute: () => rootRouteImport,
} as any)
const LayoutIndexRoute = LayoutIndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => LayoutRouteRoute,
} as any)
const LayoutCartRoute = LayoutCartRouteImport.update({
  id: '/cart',
  path: '/cart',
  getParentRoute: () => LayoutRouteRoute,
} as any)
const LayoutArtistRoute = LayoutArtistRouteImport.update({
  id: '/artist',
  path: '/artist',
  getParentRoute: () => LayoutRouteRoute,
} as any)
const ApiZeroPushServerRoute = ApiZeroPushServerRouteImport.update({
  id: '/api/zero/push',
  path: '/api/zero/push',
  getParentRoute: () => rootServerRouteImport,
} as any)
const ApiAuthRefreshServerRoute = ApiAuthRefreshServerRouteImport.update({
  id: '/api/auth/refresh',
  path: '/api/auth/refresh',
  getParentRoute: () => rootServerRouteImport,
} as any)
const ApiAuthSplatServerRoute = ApiAuthSplatServerRouteImport.update({
  id: '/api/auth/$',
  path: '/api/auth/$',
  getParentRoute: () => rootServerRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/artist': typeof LayoutArtistRoute
  '/cart': typeof LayoutCartRoute
  '/': typeof LayoutIndexRoute
}
export interface FileRoutesByTo {
  '/artist': typeof LayoutArtistRoute
  '/cart': typeof LayoutCartRoute
  '/': typeof LayoutIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/_layout': typeof LayoutRouteRouteWithChildren
  '/_layout/artist': typeof LayoutArtistRoute
  '/_layout/cart': typeof LayoutCartRoute
  '/_layout/': typeof LayoutIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/artist' | '/cart' | '/'
  fileRoutesByTo: FileRoutesByTo
  to: '/artist' | '/cart' | '/'
  id:
    | '__root__'
    | '/_layout'
    | '/_layout/artist'
    | '/_layout/cart'
    | '/_layout/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  LayoutRouteRoute: typeof LayoutRouteRouteWithChildren
}
export interface FileServerRoutesByFullPath {
  '/api/auth/$': typeof ApiAuthSplatServerRoute
  '/api/auth/refresh': typeof ApiAuthRefreshServerRoute
  '/api/zero/push': typeof ApiZeroPushServerRoute
}
export interface FileServerRoutesByTo {
  '/api/auth/$': typeof ApiAuthSplatServerRoute
  '/api/auth/refresh': typeof ApiAuthRefreshServerRoute
  '/api/zero/push': typeof ApiZeroPushServerRoute
}
export interface FileServerRoutesById {
  __root__: typeof rootServerRouteImport
  '/api/auth/$': typeof ApiAuthSplatServerRoute
  '/api/auth/refresh': typeof ApiAuthRefreshServerRoute
  '/api/zero/push': typeof ApiZeroPushServerRoute
}
export interface FileServerRouteTypes {
  fileServerRoutesByFullPath: FileServerRoutesByFullPath
  fullPaths: '/api/auth/$' | '/api/auth/refresh' | '/api/zero/push'
  fileServerRoutesByTo: FileServerRoutesByTo
  to: '/api/auth/$' | '/api/auth/refresh' | '/api/zero/push'
  id: '__root__' | '/api/auth/$' | '/api/auth/refresh' | '/api/zero/push'
  fileServerRoutesById: FileServerRoutesById
}
export interface RootServerRouteChildren {
  ApiAuthSplatServerRoute: typeof ApiAuthSplatServerRoute
  ApiAuthRefreshServerRoute: typeof ApiAuthRefreshServerRoute
  ApiZeroPushServerRoute: typeof ApiZeroPushServerRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_layout': {
      id: '/_layout'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof LayoutRouteRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_layout/': {
      id: '/_layout/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof LayoutIndexRouteImport
      parentRoute: typeof LayoutRouteRoute
    }
    '/_layout/cart': {
      id: '/_layout/cart'
      path: '/cart'
      fullPath: '/cart'
      preLoaderRoute: typeof LayoutCartRouteImport
      parentRoute: typeof LayoutRouteRoute
    }
    '/_layout/artist': {
      id: '/_layout/artist'
      path: '/artist'
      fullPath: '/artist'
      preLoaderRoute: typeof LayoutArtistRouteImport
      parentRoute: typeof LayoutRouteRoute
    }
  }
}
declare module '@tanstack/react-start/server' {
  interface ServerFileRoutesByPath {
    '/api/zero/push': {
      id: '/api/zero/push'
      path: '/api/zero/push'
      fullPath: '/api/zero/push'
      preLoaderRoute: typeof ApiZeroPushServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
    '/api/auth/refresh': {
      id: '/api/auth/refresh'
      path: '/api/auth/refresh'
      fullPath: '/api/auth/refresh'
      preLoaderRoute: typeof ApiAuthRefreshServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
    '/api/auth/$': {
      id: '/api/auth/$'
      path: '/api/auth/$'
      fullPath: '/api/auth/$'
      preLoaderRoute: typeof ApiAuthSplatServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
  }
}

interface LayoutRouteRouteChildren {
  LayoutArtistRoute: typeof LayoutArtistRoute
  LayoutCartRoute: typeof LayoutCartRoute
  LayoutIndexRoute: typeof LayoutIndexRoute
}

const LayoutRouteRouteChildren: LayoutRouteRouteChildren = {
  LayoutArtistRoute: LayoutArtistRoute,
  LayoutCartRoute: LayoutCartRoute,
  LayoutIndexRoute: LayoutIndexRoute,
}

const LayoutRouteRouteWithChildren = LayoutRouteRoute._addFileChildren(
  LayoutRouteRouteChildren,
)

const rootRouteChildren: RootRouteChildren = {
  LayoutRouteRoute: LayoutRouteRouteWithChildren,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
const rootServerRouteChildren: RootServerRouteChildren = {
  ApiAuthSplatServerRoute: ApiAuthSplatServerRoute,
  ApiAuthRefreshServerRoute: ApiAuthRefreshServerRoute,
  ApiZeroPushServerRoute: ApiZeroPushServerRoute,
}
export const serverRouteTree = rootServerRouteImport
  ._addFileChildren(rootServerRouteChildren)
  ._addFileTypes<FileServerRouteTypes>()
