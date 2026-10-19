declare module "connect-pg-simple" {
  import type { Pool } from "pg";
  import type session from "express-session";

  type SessionStoreOptions = {
    pool: Pool;
    tableName: string;
    createTableIfMissing: boolean;
    pruneSessionInterval: number;
  };

  type SessionStoreConstructor = new (
    options: SessionStoreOptions,
  ) => session.Store;

  function connectPgSimple(
    expressSession: typeof session,
  ): SessionStoreConstructor;

  export default connectPgSimple;
}
