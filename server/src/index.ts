import "dotenv/config";
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { initializeDatabase, pool } from "./db.js";
import {
  bootstrapAdministrator,
  createUser,
  deleteUser,
  listUsers,
  loadCurrentUser,
  login,
  logout,
  requireAuthentication,
  requireModuleAccess,
} from "./users.js";

const app = express();
const port = Number(process.env.API_PORT ?? 3001);
const sessionTimeoutSeconds = Number(
  process.env.SESSION_TIMEOUT_SECONDS ?? 1800,
);
const sessionSecret = process.env.SESSION_SECRET;
const cookieSecure = process.env.SESSION_COOKIE_SECURE === "true";
const PgSessionStore = connectPgSimple(session);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("API_PORT must be a valid TCP port.");
}
if (!Number.isInteger(sessionTimeoutSeconds) || sessionTimeoutSeconds < 60) {
  throw new Error("SESSION_TIMEOUT_SECONDS must be at least 60.");
}
if (!sessionSecret || sessionSecret.length < 32 || /replace|change[-_ ]?me/i.test(sessionSecret)) {
  throw new Error("Set SESSION_SECRET to a unique random value of at least 32 characters.");
}

app.set("trust proxy", process.env.NODE_ENV === "production" ? 1 : false);
app.use(helmet());
app.use(express.json({ limit: "20kb" }));
app.use("/api", (_request, response, next) => {
  response.setHeader("Cache-Control", "no-store");
  next();
});
app.use(
  session({
    name: "deeparted.sid",
    secret: sessionSecret,
    store: new PgSessionStore({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
      pruneSessionInterval: 900,
    }),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: cookieSecure,
      maxAge: sessionTimeoutSeconds * 1000,
    },
  }),
);
app.use("/api", loadCurrentUser);

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/auth/session", (request, response) => {
  response.json({ user: request.currentUser ?? null });
});

app.post(
  "/api/auth/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many sign-in attempts. Try again later." },
  }),
  login,
);
app.post("/api/auth/logout", logout);

app.get(
  "/api/users",
  requireAuthentication,
  requireModuleAccess("Users", "view"),
  listUsers,
);
app.post(
  "/api/users",
  requireAuthentication,
  requireModuleAccess("Users", "edit"),
  createUser,
);
app.delete(
  "/api/users/:id",
  requireAuthentication,
  requireModuleAccess("Users", "edit"),
  deleteUser,
);

app.use("/api", (request, response) => {
  response.status(404).json({ error: `Unknown API route: ${request.method} ${request.path}` });
});

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("API request failed.", error);
    if (response.headersSent) return;
    response.status(500).json({ error: "An unexpected server error occurred." });
  },
);

async function start(): Promise<void> {
  await initializeDatabase();
  await bootstrapAdministrator();
  app.listen(port, "0.0.0.0", () => {
    console.info(`Deeparted API listening on port ${port}.`);
  });
}

start().catch(async (error: unknown) => {
  console.error("Unable to start the Deeparted API.", error);
  await pool.end();
  process.exitCode = 1;
});
