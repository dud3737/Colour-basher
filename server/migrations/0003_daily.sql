-- Grid of the Day: one secret random seed per UK day, and each player's single official attempt
CREATE TABLE IF NOT EXISTS daily (
  day      TEXT PRIMARY KEY,          -- UK date, e.g. 2026-11-01
  seed     INTEGER NOT NULL,
  created  INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS daily_attempts (
  player_id  TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  day        TEXT NOT NULL,
  started    INTEGER NOT NULL,         -- server time when the official go began
  finished   INTEGER,                  -- server time when the result arrived (NULL = not finished)
  ms         INTEGER,                  -- final time incl. +5 s per wrong tap
  wrong      INTEGER,
  PRIMARY KEY (player_id, day)
);
CREATE INDEX IF NOT EXISTS idx_daily_board ON daily_attempts (day, ms);
