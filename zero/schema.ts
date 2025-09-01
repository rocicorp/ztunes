import {
  ANYONE_CAN,
  ExpressionBuilder,
  PermissionsConfig,
  type Row,
  definePermissions,
  Schema as ZeroSchema,
} from '@rocicorp/zero';
import {schema as genSchema} from './schema.gen';

export const schema = {
  ...genSchema,
  enableLegacyMutators: false,
} as const satisfies ZeroSchema;

export type Schema = typeof schema;
export type Artist = Row<typeof schema.tables.artist>;
export type Album = Row<typeof schema.tables.album>;

export type AuthData = {
  // The logged-in user.
  sub: string;
};

const allowIfCartOwner = (
  authData: AuthData,
  {cmp}: ExpressionBuilder<Schema, 'cartItem'>,
) => {
  // You can see a cart item if you are its owner.
  return cmp('userId', authData.sub);
};

export const permissions = definePermissions<{}, Schema>(schema, () => {
  return {
    album: {
      row: {
        select: ANYONE_CAN,
      },
    },
    artist: {
      row: {
        select: ANYONE_CAN,
      },
    },
    cartItem: {
      row: {
        select: [allowIfCartOwner],
      },
    },
  } satisfies PermissionsConfig<AuthData, Schema>;
});
