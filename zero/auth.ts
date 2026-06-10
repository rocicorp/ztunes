export type Context =
  | {
      userId: string;
      clientIP: string | undefined;
    }
  | undefined;

declare module '@rocicorp/zero' {
  interface DefaultTypes {
    context: Context;
  }
}
