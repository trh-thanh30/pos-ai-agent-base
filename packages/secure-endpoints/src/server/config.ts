import { createLogger, LoggerConfigOptions, LoggerInstance } from "@repo/logger";

const loggerConfig: LoggerConfigOptions = {
    serviceName: 'secure-endpoints',
    enableConsole: true,
    enableLoki: false,
    logLevel: 'error',
    env: (process.env.NODE_ENV as LoggerConfigOptions['env']) || 'development',
    enableFile: false,
    filePath: '',
    defaultMeta: {},
}

export const logger: LoggerInstance = createLogger(loggerConfig);