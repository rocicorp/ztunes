import {Schema as ZeroSchema, createBuilder} from '@rocicorp/zero';
import {schema as genSchema} from './schema.gen';

export const schema = {
  ...genSchema,
  enableLegacyMutators: false,
  enableLegacyQueries: false,
} as const satisfies ZeroSchema;

export const zql = createBuilder(schema);

export type Schema = typeof schema;

declare module '@rocicorp/zero' {
  interface DefaultTypes {
    schema: typeof schema;
  }
}
