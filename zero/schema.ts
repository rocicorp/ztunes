import { ANYONE_CAN, ExpressionBuilder, PermissionsConfig, type Row, definePermissions } from "@rocicorp/zero";
import { schema, type Schema } from "./schema.gen";

export { schema, type Schema };

export type Artist = Row<typeof schema.tables.artist>;
export type Album = Row<typeof schema.tables.album>;

type AuthData = {
  // The logged-in user.
  sub: string;
};

const allowIfCartOwner = (
  authData: AuthData,
  { cmp }: ExpressionBuilder<Schema, 'cart'>,
) => cmp('userId', authData.sub);

export const permissions = definePermissions<{}, Schema>(schema, () => {
  return {
    album: {
      row: {
        select: ANYONE_CAN,
      }
    },
    artist: {
      row: {
        select: ANYONE_CAN,
      }
    },
    cart: {
      row: {
        select: [allowIfCartOwner],
      }
    }
  } satisfies PermissionsConfig<AuthData, Schema>;
});
