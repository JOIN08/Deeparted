import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";
import { randomBytes } from "node:crypto";
import { normalizeUserAccess, PERMISSION_MODULES } from "../../shared/access.js";
import type { PermissionModule, UserAccess } from "../../shared/access.js";
import { pool } from "./db.js";

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,32}$/;
const BCRYPT_COST = 12;
const dummyPasswordHash = bcrypt.hash(
  randomBytes(32).toString("hex"),
  BCRYPT_COST,
);

type UserRow = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  job_title: string;
  password_hash?: string;
  access: unknown;
  is_admin: boolean;
  created_at: Date;
};

export type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  jobTitle: string;
  access: UserAccess;
  isAdmin: boolean;
  createdAt: string;
};

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    username: row.username,
    jobTitle: row.job_title,
    access: row.is_admin ? allModuleAccess() : normalizeUserAccess(row.access),
    isAdmin: row.is_admin,
    createdAt: row.created_at.toISOString(),
  };
}

export async function bootstrapAdministrator(): Promise<void> {
  const countResult = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM users",
  );
  if (Number(countResult.rows[0]?.count ?? 0) > 0) return;

  const username = process.env.BOOTSTRAP_ADMIN_USERNAME?.trim();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const firstName = process.env.BOOTSTRAP_ADMIN_FIRST_NAME?.trim();
  const lastName = process.env.BOOTSTRAP_ADMIN_LAST_NAME?.trim();
  if (!username || !password || !firstName || !lastName) {
    throw new Error(
      "The database is empty. Set the BOOTSTRAP_ADMIN_* values to create the first administrator.",
    );
  }
  if (
    !USERNAME_PATTERN.test(username) ||
    password.length < 12 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    throw new Error(
      "Bootstrap administrator credentials are invalid: use a 3-32 character username and a 12-72 character password.",
    );
  }
  if (
    ["replace-with-a-unique-password-at-least-12-characters", "change-me", "password"]
      .includes(password.toLowerCase())
  ) {
    throw new Error("Set a unique BOOTSTRAP_ADMIN_PASSWORD before starting.");
  }

  const access = Object.fromEntries(
    PERMISSION_MODULES.map(({ name }) => [
      name,
      { view: true, edit: true },
    ]),
  );
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  await pool.query(
    `INSERT INTO users
      (first_name, last_name, username, username_normalized, password_hash, access, is_admin)
     VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
    [
      firstName,
      lastName,
      username,
      username.toLocaleLowerCase("en-US"),
      passwordHash,
      JSON.stringify(access),
    ],
  );
  console.info(`Created initial administrator account "${username}".`);
}

export async function loadCurrentUser(
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  if (!request.session.userId) {
    next();
    return;
  }

  try {
    const result = await pool.query<UserRow>(
      `SELECT id, first_name, last_name, username, job_title,
              access, is_admin, created_at
         FROM users
        WHERE id = $1 AND is_active = TRUE`,
      [request.session.userId],
    );
    const row = result.rows[0];
    if (!row) {
      request.session.destroy((error) => {
        if (error) {
          next(error);
          return;
        }
        next();
      });
      return;
    }
    request.currentUser = {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      username: row.username,
      jobTitle: row.job_title,
      access: row.is_admin ? allModuleAccess() : normalizeUserAccess(row.access),
      isAdmin: row.is_admin,
      createdAt: row.created_at.toISOString(),
    };
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAuthentication(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (!request.currentUser) {
    response.status(401).json({ error: "Sign in is required." });
    return;
  }
  next();
}

export function requireModuleAccess(
  module: PermissionModule,
  permission: "view" | "edit",
) {
  return (
    request: Request,
    response: Response,
    next: NextFunction,
  ): void => {
    const user = request.currentUser;
    if (!user) {
      response.status(401).json({ error: "Sign in is required." });
      return;
    }
    if (!user.isAdmin && !user.access[module][permission]) {
      response.status(403).json({ error: "You do not have permission for this action." });
      return;
    }
    next();
  };
}

export async function login(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const body =
    request.body && typeof request.body === "object"
      ? (request.body as Record<string, unknown>)
      : {};
  const { username, password } = body as {
    username?: unknown;
    password?: unknown;
  };
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.trim().length > 32 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    response.status(400).json({ error: "Enter a valid username and password." });
    return;
  }

  try {
    const normalizedUsername = username.trim().toLocaleLowerCase("en-US");
    const result = await pool.query<UserRow>(
      `SELECT id, first_name, last_name, username, job_title, password_hash,
              access, is_admin, created_at
         FROM users
        WHERE username_normalized = $1 AND is_active = TRUE`,
      [normalizedUsername],
    );
    const user = result.rows[0];
    const hashToCheck = user?.password_hash ?? (await dummyPasswordHash);
    const passwordMatches = await bcrypt.compare(password, hashToCheck);
    if (!user || !passwordMatches) {
      response.status(401).json({ error: "Incorrect username or password." });
      return;
    }

    request.session.regenerate((regenerateError) => {
      if (regenerateError) {
        next(regenerateError);
        return;
      }
      request.session.userId = user.id;
      request.session.save((saveError) => {
        if (saveError) {
          next(saveError);
          return;
        }
        response.json({ user: toPublicUser(user) });
      });
    });
  } catch (error) {
    next(error);
  }
}

export function logout(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (!request.session) {
    response.sendStatus(204);
    return;
  }
  request.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }
    response.clearCookie("deeparted.sid");
    response.sendStatus(204);
  });
}

export async function listUsers(
  _request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await pool.query<UserRow>(
      `SELECT id, first_name, last_name, username, job_title,
              access, is_admin, created_at
         FROM users
        ORDER BY is_admin DESC, created_at DESC`,
    );
    response.json({ users: result.rows.map(toPublicUser) });
  } catch (error) {
    next(error);
  }
}

export async function createUser(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const body =
    request.body && typeof request.body === "object"
      ? (request.body as Record<string, unknown>)
      : {};
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const jobTitle =
    typeof body.jobTitle === "string" && body.jobTitle.trim()
      ? body.jobTitle.trim()
      : "Staff";
  const password = typeof body.password === "string" ? body.password : "";
  if (
    !firstName ||
    firstName.length > 80 ||
    !lastName ||
    lastName.length > 80 ||
    !USERNAME_PATTERN.test(username) ||
    !password ||
    password.length < 12 ||
    Buffer.byteLength(password, "utf8") > 72 ||
    jobTitle.length > 120
  ) {
    response.status(400).json({
      error: "Provide valid names, a 3-32 character username, and a 12-72 character password.",
    });
    return;
  }

  try {
    const access = normalizeUserAccess(body.access);
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    const result = await pool.query<UserRow>(
      `INSERT INTO users
        (first_name, last_name, username, username_normalized, job_title, password_hash, access)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, first_name, last_name, username, job_title,
                 access, is_admin, created_at`,
      [
        firstName,
        lastName,
        username,
        username.toLocaleLowerCase("en-US"),
        jobTitle,
        passwordHash,
        JSON.stringify(access),
      ],
    );
    response.status(201).json({ user: toPublicUser(result.rows[0]) });
  } catch (error) {
    if (isUniqueViolation(error)) {
      response.status(409).json({ error: "A user with that username already exists." });
      return;
    }
    next(error);
  }
}

export async function deleteUser(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const targetIdParameter = request.params.id;
  const targetId = Array.isArray(targetIdParameter)
    ? targetIdParameter[0]
    : targetIdParameter;
  if (!/^[0-9a-f-]{36}$/i.test(targetId)) {
    response.status(400).json({ error: "Invalid user identifier." });
    return;
  }
  if (request.currentUser?.id === targetId) {
    response.status(409).json({ error: "You cannot delete your own signed-in account." });
    return;
  }

  try {
    const result = await pool.query<{ is_admin: boolean }>(
      "DELETE FROM users WHERE id = $1 AND is_admin = FALSE RETURNING is_admin",
      [targetId],
    );
    if (!result.rowCount) {
      response.status(404).json({ error: "User not found or cannot be deleted." });
      return;
    }
    response.sendStatus(204);
  } catch (error) {
    next(error);
  }
}

function allModuleAccess(): UserAccess {
  return Object.fromEntries(
    PERMISSION_MODULES.map(({ name }) => [
      name,
      { view: true, edit: true },
    ]),
  ) as UserAccess;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}
