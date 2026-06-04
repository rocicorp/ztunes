import {createFileRoute} from '@tanstack/react-router';
import z from 'zod';
import {mutators, mutatorValidators} from 'zero/mutators';

type DiscoveredMutator = {
  name: string;
};

function isMutator(value: unknown): value is {
  mutatorName: string;
  fn: unknown;
  validator: unknown;
} {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value !== null &&
    'mutatorName' in value &&
    typeof value.mutatorName === 'string' &&
    'fn' in value &&
    typeof value.fn === 'function'
  );
}

function collectMutators(
  value: unknown,
  discovered: DiscoveredMutator[],
): void {
  if (
    (typeof value !== 'object' && typeof value !== 'function') ||
    value === null
  ) {
    return;
  }

  if (isMutator(value)) {
    discovered.push({name: value.mutatorName});
    return;
  }

  for (const child of Object.values(value)) {
    collectMutators(child, discovered);
  }
}

function isZodSchema(value: unknown): value is z.ZodType {
  return typeof value === 'object' && value !== null && '_def' in value;
}

function getValidatorByMutatorName(name: string): unknown {
  const parts = name.split('.');
  let current: unknown = mutatorValidators;

  for (const part of parts) {
    if (typeof current !== 'object' || current === null || !(part in current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

function toInputSchema(name: string): unknown {
  const validator = getValidatorByMutatorName(name);
  if (!isZodSchema(validator)) {
    return {
      type: 'object',
      additionalProperties: true,
    };
  }

  try {
    return z.toJSONSchema(validator);
  } catch {
    return {
      type: 'object',
      additionalProperties: true,
    };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function buildExampleFromSchema(schema: unknown): unknown {
  if (!isRecord(schema)) {
    return {};
  }

  if (schema.type === 'string') {
    if (Array.isArray(schema.enum) && schema.enum.length > 0) {
      return schema.enum[0];
    }
    return 'string';
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    return 0;
  }

  if (schema.type === 'boolean') {
    return true;
  }

  if (schema.type === 'array') {
    if (!('items' in schema)) {
      return [];
    }
    return [buildExampleFromSchema(schema.items)];
  }

  if (schema.type === 'object') {
    const properties = isRecord(schema.properties) ? schema.properties : {};
    const required = Array.isArray(schema.required)
      ? schema.required.filter((v): v is string => typeof v === 'string')
      : [];
    const keys = required.length > 0 ? required : Object.keys(properties);
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      out[key] = buildExampleFromSchema(properties[key]);
    }
    return out;
  }

  if ('const' in schema) {
    return schema.const;
  }

  if ('default' in schema) {
    return schema.default;
  }

  if (Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
    return buildExampleFromSchema(schema.anyOf[0]);
  }

  if (Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
    return buildExampleFromSchema(schema.oneOf[0]);
  }

  return {};
}

export const Route = createFileRoute('/api/openapi.json')({
  server: {
    handlers: {
      GET: ({request}) => {
    const url = new URL(request.url);
    const discovered: DiscoveredMutator[] = [];
    collectMutators(mutators, discovered);
    discovered.sort((a, b) => a.name.localeCompare(b.name));

    const paths = Object.fromEntries(
      discovered.map(({name}) => {
        const mutatorPath = `/api/mutators/${name.replaceAll('.', '/')}`;
        const inputSchema = toInputSchema(name);
        const inputExample = buildExampleFromSchema(inputSchema);
        return [
          mutatorPath,
          {
            post: {
              operationId: name,
              summary: `Run Zero mutator ${name}`,
              tags: ['mutators'],
              security: [{cookieAuth: []}],
              requestBody: {
                required: false,
                content: {
                  'application/json': {
                    schema: inputSchema,
                    examples: {
                      example: {
                        summary: `${name} request`,
                        value: inputExample,
                      },
                    },
                  },
                },
              },
              responses: {
                '200': {
                  description: 'Mutation applied',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          ok: {const: true},
                        },
                        required: ['ok'],
                        additionalProperties: false,
                      },
                      examples: {
                        success: {
                          value: {ok: true},
                        },
                      },
                    },
                  },
                },
                '400': {
                  description: 'Validation or mutation error',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          error: {type: 'string'},
                        },
                        required: ['error'],
                        additionalProperties: false,
                      },
                      examples: {
                        error: {
                          value: {error: 'Invalid JSON body'},
                        },
                      },
                    },
                  },
                },
                '401': {
                  description: 'Unauthorized',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          error: {type: 'string'},
                        },
                        required: ['error'],
                        additionalProperties: false,
                      },
                      examples: {
                        unauthorized: {
                          value: {error: 'Unauthorized'},
                        },
                      },
                    },
                  },
                },
                '404': {
                  description: 'Mutator not found',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          error: {type: 'string'},
                        },
                        required: ['error'],
                        additionalProperties: false,
                      },
                      examples: {
                        notFound: {
                          value: {error: 'Unknown mutator: cart.unknown'},
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ];
      }),
    );

    return Response.json({
      openapi: '3.1.0',
      info: {
        title: 'ztunes Mutator API',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'better-auth.session_token',
          },
        },
      },
      servers: [
        {
          url: url.origin,
        },
      ],
      paths,
    });
      },
    },
  },
});
