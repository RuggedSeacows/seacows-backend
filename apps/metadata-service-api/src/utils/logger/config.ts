import type { LoggerOptions } from "winston";
import { format, transports } from "winston";

const formattedTimestamp = format.timestamp({
  format: "YYYY-MM-DD HH:mm:ss.SSS",
});

const colorizer = format.colorize({
  colors: {
    fatal: "red",
    error: "red",
    warn: "yellow",
    info: "blue",
    debug: "white",
    trace: "grey",
  },
});

const WINSTON_DEV_FORMAT = format.combine(
  format.errors({ stack: true }),
  colorizer,
  formattedTimestamp,
  format.simple()
);
const WINSTON_PROD_FORMAT = format.combine(format.errors({ stack: true }), formattedTimestamp, format.json());

/**
 * Winston logging backend format configuration options
 */
export const loggerConfig = (gloablTags: Record<string, string> = {}): LoggerOptions => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    levels: {
      fatal: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4,
      trace: 5,
    },
    level: process.env.LOG_LEVEL ?? "info",
    format: isProduction ? WINSTON_PROD_FORMAT : WINSTON_DEV_FORMAT,
    defaultMeta: gloablTags,
    transports: [new transports.Console()],
    exceptionHandlers: [new transports.Console()],
    rejectionHandlers: [new transports.Console()],
  };
};
