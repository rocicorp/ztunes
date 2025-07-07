# ztunes

A sync-based ecommerce app with 88k artists and 200k albums from the 1990's.

Built with:

- [Zero](https://zerosync.dev/)
- [TanStack Start](https://tanstack.com/)
- [Drizzle](https://orm.drizzle.team/)
- [Better Auth](https://www.better-auth.com/)
- [Fly.io](https://fly.io/)

Live demo: https://ztunes.rocicorp.dev

# Features

- All navigtions and mutations are literally instant (next-frame)
- < 1s cold cache LCP, anywhere on Earth
- < 0.5s warm cache LCP
- Instant search results over 1k most popular artists, with later asynchronous results over all data
- Async search results don't jostle UI – the initial local results are always the best results, sorted first
- Fine-grained read and write permissions (for the shopping cart)

# Get started

1. Install [Docker](https://docker.com/) (note orbStack doesn't work yet – sorry, [let us know](https://discord.rocicorp.dev/) if you know the fix)
2. `cp .env.sample .env`, then fill in all the required vars
3. Run:

```bash
npm install
npm run dev
```

# Tour of the code

## Database

The database is Postgres, run under Docker during dev (see `scripts/dev-db.ts`).

In production, point it at any Postgres database using the `ZERO_UPSTREAM_DB` and `PG_URL` env vars.

## Schema

The schema is managed using Drizzle (see `db/schema.ts`).

[`drizzle-zero`](https://github.com/BriefHQ/drizzle-zero) is used to generate the Zero schema (in `zero/schema.gen.ts`). You do not need to worry about the Zero schema at all - it is completely automated. The only exception is to set up read permissions (see `zero/schema.ts`).

The Zero schema is auto-generated during dev when the Drizzle schema changes.

The Drizzle schema is **not** automatically pushed to your dev db because that could destroy data. To push your Drizzle schema changes during dev just use the normal `npx drizzle-kit push`.

## TanStack Start

This app uses TanStack Start in [SPA mode](https://tanstack.com/start/latest/docs/framework/react/spa-mode). There is no server-side rendering. Zero doesn't currently support SSR and SSR'ing even the shell results in a slower overall startup. See the comment in `auth/auth.ts` for more information about this setup.

However, that doesn't mean the app is client-side only. TanStack's API routes are used for the various API endpoints needed by both Zero and Better Auth. See `app/routes/api`.

## Auth

The auth setup is slightly non-standard. We encode the userID, email, and JWT in the browser cookie and make it client-visible. See `auth/auth.ts` for more information.

This is not ideal for security (it would be better to not expose credentials to client JS because of XSS risks), but it is basically required by Zero right now. Doing other things makes the app much slower without improving security significantly.

The Zero team is working on improving this and getting the same perf w/o needing to expose credentials to the client.

## Zero

This app uses custom mutators (see `zero/mutators.ts`) to enforce that a user can only add items to their own cart. Note that there is no need for an explicit permission check anywhere. Instead, the mutator gets the `userID` out of the session and only writes to that users' data. There is no need for a check because there is no way for the client to specify a different `userID`. Basically it works just like a normal web app would.

Zero read permissions are used for the corresponding cart read permissions (see `zero/schema.ts`).

## Link Preloading

An important consideration in any Zero app is what to preload. Our general advice is "any data the app needs within one click".

In TanStack we can mostly achieve this elegantly via TanStack's built-in
[preload feature](https://tanstack.com/router/v1/docs/framework/react/guide/preloading).

Each `Route` defines a free `query` function which it uses in TanStack's `loader` method:

```ts
function query(zero: Zero<Schema, Mutators>, artistID: string | undefined) {
  return zero.query.artist
    .where('id', artistID ?? '')
    .related('albums', album => album.related('cartItems'))
    .one();
}

export const Route = createFileRoute('/_layout/artist')({
  // ...
  loader: async ({context, deps: {artistId}}) => {
    const {zero} = context;
    query(zero, artistId).preload({ttl: '5m'}).cleanup();
  },
});
```

Then this same `query` function is used during render like normal:

```ts
const [artist] = useQuery(query(zero, id));
```

The result is that any link visible on screen will navigate instantly. Additionally:

- Preloaded data is automatically kept up-to-date by Zero – no stale or inconsistent caches
- All mutations are instantaneous by default
- Realtime collaboration for free

## Search Preloading

TanStack's built-in preloading only helps with links. We want instant search too.

To support this, ztunes preloads a subset of artist data at app startup, so that it can be
searched over locally.

This is something most apps will want to to do, but the question is _what_ data to preload.
We want enough data to cover the most common things users will search for, but not so much that app
startup begins to suffer.

ztunes' choice is to preload the first 1k (out of 88k) most popular artists (by a `popularity` field in the `artist` table). This 1k records is the dataset that is searched locally.

This works out nicely because it is very likely that anything the user searches is going to be contained in that most popular 1k.

Asynchronously, just like all Zero queries, the search also goes to the server. So if the user picks something obscure, they will still get the result, just more slowly.

## Jostle-Free Search UX

We want to provide instant results over local data, but we don't want to "jostle" (reorder) those results when server result comes in asynchronously. This would make the UX very hard to read and negate any benefit from instant results.

To prevent this jostle, ztunes sorts all query results by popularity descending. This way any local results are by definition the most popular and are at the top of the list. Other results pop in below.

In general you will want to preload data in the same order you will be displaying in search results.

## Search Notes

Zero currently lacks first-class text indexing. This means searches are going to be worst-case `O(n)`. This worst case occurs when there are fewer matching records in the database than the app requests with `limit`. It also occurs if the sort of the query doesn't match the sort order of an index.

So for example, if the user searches `f`, that's going to get fast results because the UI requests 20 results and there are many more than 20 matches for this string.

But if the user searches `foo fighters`, it will be `O(n)` because Zero will scan all aritsts trying to come up with 20 matches.

In the future Zero will have first-class search that will improve this. For now, 88k records is not a large enough amount of records to search to make a significant difference in query performance.

If you apply this pattern to your own apps keep in mind this performance quirk. If you need better text search let us know, as we have some ideas for quick fixes.

## Deployment

We run a live deployment of ztunes, continuously updated, on Fly.io, Supabase, and Vercel.

We run `zero-cache` in [single-node mode](https://zero.rocicorp.dev/docs/deployment#guide-single-node-on-flyio), which is easy and fine for a small app.

See `fly.toml` to deploy to your own account.

## Continuous Integration

We continuously deploy ztunes using Github CI. See `deploy.yml` for how this is done.

One important thing to observe here is that the order of updates does matter. We recommend, as a default:

1. Update Postgres schema
2. Update Zero permissions
3. Update `zero-cache`
4. Update UI in Vercel

Because of (2) being after (1) a permission change can be done atomically in the same deploy with schema changes it relies on.

Because of (4) being at the end UI changes can be deployed atomically that depend on new schema, new permissions, or new version of `zero-cache`.

In the case of removing features from your schema you must roll out the UI first, wait for users to update, then separately roll out the schema change. See [the Zero docs](https://zero.rocicorp.dev/docs/zero-schema#schema-change-process) for more information on schema changes.
