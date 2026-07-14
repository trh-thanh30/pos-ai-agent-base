import { join } from 'path';
const cwd = process.cwd();

export const apps = [
    {
        name: 'pos-web-main',
        script: 'pnpm run start',
        cwd: join(cwd, 'apps/web/main'),
        watch: false,
        env_file: join(cwd, '.env.production'),
        env_production: {
            NODE_ENV: 'production',
        },
        out_file: "./front-end-out.log",
        error_file: "./front-end-error.log",
        log_date_format: "DD-MM HH:mm:ss Z",
    },
    {
        name: 'pos-api',
        script: 'pnpm run start:prod',
        cwd: join(cwd, 'apps/api'),
        watch: false,
        env_file: join(cwd, '.env.production'),
        env_production: {
            NODE_ENV: 'production',
        },
        out_file: "./back-end-out.log",
        error_file: "./back-end-error.log",
        log_date_format: "DD-MM HH:mm:ss Z",
    }
];
