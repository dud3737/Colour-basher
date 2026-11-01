-- Players: chosen name + random id; only a hash of their secret token is stored
CREATE TABLE IF NOT EXISTS players (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  name_key    TEXT NOT NULL UNIQUE,
  token_hash  TEXT NOT NULL,
  hidden      INTEGER NOT NULL DEFAULT 0,   -- moderation: 1 = removed from leaderboards
  created     INTEGER NOT NULL,
  updated     INTEGER NOT NULL
);
-- One row per game (run); updated as the run progresses
CREATE TABLE IF NOT EXISTS scores (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id  TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  run_id     TEXT NOT NULL,
  score      INTEGER NOT NULL,
  level      INTEGER NOT NULL,
  play_ms    INTEGER NOT NULL,
  week       TEXT NOT NULL,                   -- ISO week, e.g. 2026-W44 (UTC)
  created    INTEGER NOT NULL,
  updated    INTEGER NOT NULL,
  UNIQUE (player_id, run_id)
);
CREATE INDEX IF NOT EXISTS idx_scores_player ON scores (player_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_week   ON scores (week, score DESC);
-- Rate limiting: keys contain a salted, daily-rotating hash of the connection address (never the address itself)
CREATE TABLE IF NOT EXISTS rate (
  key      TEXT PRIMARY KEY,
  count    INTEGER NOT NULL,
  expires  INTEGER NOT NULL
);
