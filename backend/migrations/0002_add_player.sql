ALTER TABLE events ADD COLUMN player TEXT NOT NULL DEFAULT '';
CREATE INDEX events_match_minute_date ON events(match_id, minute, created_at);
