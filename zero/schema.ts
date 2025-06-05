import { ANYONE_CAN, PermissionsConfig, type Row, definePermissions } from "@rocicorp/zero";
import { schema, type Schema } from "./schema.gen";

export { schema, type Schema };

export type Artist = Row<typeof schema.tables.artist>;
export type Album = Row<typeof schema.tables.album>;

type AuthData = {
  // The logged-in user.
  sub: string;
};

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
    }
  } satisfies PermissionsConfig<AuthData, Schema>;
});
