import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
export const sqlite = new Database(process.env.DATABASE_URL || './matchlive.db');
sqlite.pragma('foreign_keys = ON');
export const db = drizzle(sqlite, {schema});
