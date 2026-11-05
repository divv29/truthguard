-- TruthGuard — Users Table Migration
-- Run with: psql -U postgres -d truthguard -f users_migration.sql

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(255) NOT NULL UNIQUE,
  role         VARCHAR(20) NOT NULL DEFAULT 'user'
                 CHECK (role IN ('admin', 'user', 'moderator')),
  password_hash TEXT NOT NULL,              -- bcrypt hash, never exposed via API
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups by email (login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Index for sorting/filtering by role
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- Seed a few demo users for the professor demo
-- Passwords below are bcrypt hashes of "password123" (never store plain text)
INSERT INTO users (name, email, role, password_hash) VALUES
  ('Divyansh Tiwari',  'divyansh@truthguard.dev',  'admin',     '$2b$10$examplehashADMIN111111111111111111111111111111111111111'),
  ('Priya Sharma',     'priya@truthguard.dev',     'moderator', '$2b$10$examplehashMOD2222222222222222222222222222222222222222222'),
  ('Rahul Verma',      'rahul@truthguard.dev',     'user',      '$2b$10$examplehashUSER33333333333333333333333333333333333333333'),
  ('Sneha Patil',      'sneha@truthguard.dev',     'user',      '$2b$10$examplehashUSER44444444444444444444444444444444444444444')
ON CONFLICT (email) DO NOTHING;
