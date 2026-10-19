CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  username VARCHAR(32) NOT NULL,
  username_normalized VARCHAR(32) NOT NULL UNIQUE,
  job_title VARCHAR(120) NOT NULL DEFAULT 'Staff',
  password_hash TEXT NOT NULL,
  access JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_created_at_idx ON users (created_at DESC);
