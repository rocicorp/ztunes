import {mustGetMutator, ReadonlyJSONValue} from '@rocicorp/zero';
import {zeroPostgresJS} from '@rocicorp/zero/server/adapters/postgresjs';
import {createFileRoute} from '@tanstack/react-router';
import {auth} from 'auth/auth';
import postgres from 'postgres';
import {must} from 'shared/must';
import {mutators} from 'zero/mutators';
import {schema} from 'zero/schema';

const pgURL = must(process.env.PG_URL, 'PG_URL is required');
const dbProvider = zeroPostgresJS(schema, postgres(pgURL));

function collectMutatorNames(value: unknown, names: Set<string>): void {
  if (
    (typeof value !== 'object' && typeof value !== 'function') ||
    value === null
  ) {
    return;
  }

  if (
    'mutatorName' in value &&
    typeof value.mutatorName === 'string' &&
    'fn' in value &&
    typeof value.fn === 'function'
  ) {
    names.add(value.mutatorName);
    return;
  }

  for (const child of Object.values(value)) {
    collectMutatorNames(child, names);
  }
}

function getMutatorNames(): string[] {
  const names = new Set<string>();
  collectMutatorNames(mutators, names);
  return [...names].sort();
}

function parseMutatorName(splat: string | undefined): string | undefined {
  if (!splat) {
    return undefined;
  }

  const parts = splat
    .split('/')
    .map(part => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return undefined;
  }

  let decodedParts: string[];
  try {
    decodedParts = parts.map(part => decodeURIComponent(part));
  } catch {
    return undefined;
  }

  return decodedParts.join('.');
}

async function parseArgs(
  request: Request,
): Promise<ReadonlyJSONValue | undefined> {
  const contentType = request.headers.get('content-type');

  if (!contentType || !contentType.includes('application/json')) {
    return undefined;
  }

  const bodyText = await request.text();
  if (bodyText.trim() === '') {
    return undefined;
  }

  return JSON.parse(bodyText);
}

export const Route = createFileRoute('/api/mutators/$')({
  server: {
    handlers: {
      GET: () => {
        return Response.json({mutators: getMutatorNames()});
      },

      POST: async ({request, params}) => {
        const session = await auth.api.getSession(request);
        if (!session) {
          return Response.json({error: 'Unauthorized'}, {status: 401});
        }

        const mutatorName = parseMutatorName(params._splat);
        if (!mutatorName) {
          return Response.json(
            {
              error:
                'Mutator name required in path, e.g. /api/mutators/cart/add',
            },
            {status: 400},
          );
        }

        let args: ReadonlyJSONValue | undefined;
        try {
          args = await parseArgs(request);
        } catch {
          return Response.json({error: 'Invalid JSON body'}, {status: 400});
        }

        let mutator;
        try {
          mutator = mustGetMutator(mutators, mutatorName);
        } catch {
          return Response.json(
            {error: `Unknown mutator: ${mutatorName}`},
            {status: 404},
          );
        }

        try {
          await dbProvider.transaction(async tx => {
            await mutator.fn({
              tx,
              ctx: {userId: session.user.id},
              args,
            });
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Mutation failed';
          return Response.json({error: message}, {status: 400});
        }

        return Response.json({ok: true});
      },
    },
  },
});
