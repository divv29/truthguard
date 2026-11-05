-- TruthGuard PostgreSQL Schema
-- Run this file to initialize the database:
--   psql -U postgres -d truthguard -f schema.sql

-- Create the articles table
CREATE TABLE IF NOT EXISTS articles (
  id           SERIAL PRIMARY KEY,
  text         TEXT NOT NULL,
  source       TEXT,
  verdict      VARCHAR(10) CHECK (verdict IN ('REAL', 'FAKE', 'UNCERTAIN')),
  confidence   INTEGER CHECK (confidence BETWEEN 0 AND 100),
  result       JSONB,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for sorting by latest first (most common query)
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles (created_at DESC);

-- Index for filtering by verdict
CREATE INDEX IF NOT EXISTS idx_articles_verdict ON articles (verdict);
