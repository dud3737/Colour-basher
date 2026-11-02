-- Fastest single level: one row per player per game per level (set once, never lowered afterwards)
CREATE TABLE IF NOT EXISTS level_times (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id  TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  run_id     TEXT NOT NULL,
  level      INTEGER NOT NULL,
  ms         INTEGER NOT NULL,
  week       TEXT NOT NULL,
  created    INTEGER NOT NULL,
  UNIQUE (player_id, run_id, level)
);
CREATE INDEX IF NOT EXISTS idx_times_player ON level_times (player_id, ms);
CREATE INDEX IF NOT EXISTS idx_times_week   ON level_times (week, ms);
