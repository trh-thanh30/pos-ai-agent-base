import { defineConfig, env } from 'prisma/config';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;

// Try to find the env file in src/prisma, apps/api or in workspace root
let envPath = path.join(__dirname, '..', '..', envFile); // apps/api/.env.development
if (!fs.existsSync(envPath)) {
  envPath = path.join(__dirname, '..', '..', '..', '..', envFile); // workspace_root/.env.development
}

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  // Try fallback to .env in both locations
  let fallbackEnvPath = path.join(__dirname, '..', '..', '.env');
  if (!fs.existsSync(fallbackEnvPath)) {
    fallbackEnvPath = path.join(__dirname, '..', '..', '..', '..', '.env');
  }
  if (fs.existsSync(fallbackEnvPath)) {
    dotenv.config({ path: fallbackEnvPath });
  }
}

// Function to recursively expand environment variables (e.g. ${DB_USER})
const expandEnv = (str: string): string => {
  let expanded = str;
  let iterations = 0;
  // Limit iterations to prevent infinite loop on circular references
  while (expanded.includes('${') && iterations < 10) {
    const next = expanded.replace(
      /\${([^}]+)}/g,
      (_, name) => process.env[name] || '',
    );
    if (next === expanded) break;
    expanded = next;
    iterations++;
  }
  return expanded;
};

// Expand all process.env variables so they reference actual values
for (const key in process.env) {
  if (process.env[key]) {
    process.env[key] = expandEnv(process.env[key]);
  }
}

// Construct DATABASE_URL if it's not defined but individual DB vars are defined
if (!process.env.DATABASE_URL) {
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || 'postgres';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || '5432';
  const dbName = process.env.DB_NAME || 'app';
  const dbSchema = process.env.DB_SCHEMA || 'public';
  process.env.DATABASE_URL = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=${dbSchema}`;
}

export default defineConfig({
  schema: 'apps/api/prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
