import { defineConfig } from 'drizzle-kit';
export default defineConfig({ dialect: 'sqlite', schema: './src/schema.ts', out: './drizzle-generated', dbCredentials: { url: process.env.DATABASE_URL || './matchlive.db' } });
