ALTER TABLE applications ADD COLUMN client_id text;
UPDATE applications SET client_id = id::text WHERE client_id IS NULL;
ALTER TABLE applications ALTER COLUMN client_id SET NOT NULL;
ALTER TABLE applications ADD CONSTRAINT applications_client_id_unique UNIQUE (client_id);
ALTER TABLE applications ADD COLUMN redirect_uris jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE authorization_codes (
  token_hash text PRIMARY KEY,
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  redirect_uri text NOT NULL,
  code_challenge text NOT NULL,
  scopes text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);

CREATE TABLE access_tokens (
  id uuid PRIMARY KEY,
  token_hash text UNIQUE NOT NULL,
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scopes text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX access_tokens_application_user_idx ON access_tokens(application_id, user_id);

CREATE TABLE refresh_tokens (
  id uuid PRIMARY KEY,
  family_id uuid NOT NULL,
  token_hash text UNIQUE NOT NULL,
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scopes text NOT NULL,
  expires_at timestamptz NOT NULL,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  replaced_by uuid
);
CREATE INDEX refresh_tokens_family_idx ON refresh_tokens(family_id);
