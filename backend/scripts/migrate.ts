import Database from 'better-sqlite3';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import 'dotenv/config';
const sqlite = new Database(process.env.DATABASE_URL || './matchlive.db');
sqlite.exec('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');
const files = readdirSync('migrations').filter(x=>x.endsWith('.sql')).sort();
for (const file of files) {
 if (sqlite.prepare('SELECT 1 FROM schema_migrations WHERE name = ?').get(file)) { console.log('YA APLICADA',file); continue; }
 const sql=readFileSync(join('migrations',file),'utf8');
 sqlite.transaction(()=>{sqlite.exec(sql);sqlite.prepare('INSERT INTO schema_migrations VALUES (?, ?)').run(file,new Date().toISOString());})();
 console.log('APLICADA',file);
}
sqlite.close();
