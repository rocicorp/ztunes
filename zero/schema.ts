import { ANYONE_CAN_DO_ANYTHING, PermissionsConfig, type Row, definePermissions } from "@rocicorp/zero";
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
    album: ANYONE_CAN_DO_ANYTHING,
    artist: ANYONE_CAN_DO_ANYTHING,
  } satisfies PermissionsConfig<AuthData, Schema>;
});
