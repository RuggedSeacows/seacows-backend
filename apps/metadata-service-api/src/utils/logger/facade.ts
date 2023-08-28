import type { Logger } from "winston";

export enum LogLevel {
  Fatal = "fatal",
  Error = "error",
  Warn = "warn",
  Info = "info",
  Debug = "debug",
  Trace = "trace",
}

/**
 * This logger requires the winston instance passed-in to be configured
 * with custom log levels to support
 */
export class WinstonLoggingFacade {
  constructor(private readonly logger: Logger) {}

  private logAtLevel(level: LogLevel, msg: string, ctx?: unknown): void {
    this.logger.log(level, msg, ctx);
  }

  trace = (msg: string, ctx?: Record<string, unknown>): void => {
    return this.logAtLevel(LogLevel.Trace, msg, ctx);
  };

  debug = (msg: string, ctx?: Record<string, unknown>): void => {
    return this.logAtLevel(LogLevel.Debug, msg, ctx);
  };

  log = (msg: string, ctx?: Record<string, unknown>): void => {
    return this.logAtLevel(LogLevel.Info, msg, ctx);
  };

  info = (msg: string, ctx?: Record<string, unknown>): void => {
    return this.logAtLevel(LogLevel.Info, msg, ctx);
  };

  warn = (msg: string, ctx?: Record<string, unknown>): void => {
    return this.logAtLevel(LogLevel.Warn, msg, ctx);
  };

  error = (msg: string, ctx?: Record<string, unknown> | Error): void => {
    return this.logAtLevel(LogLevel.Error, msg, ctx);
  };

  fatal = (msg: string, ctx?: Record<string, unknown>): void => {
    return this.logAtLevel(LogLevel.Fatal, msg, ctx);
  };

  /**
   * Get a "scoped" child logger for a particular resolver or function log traces
   * @example const childLogger = logger.getLogger('MutationResolvers')
   */
  childLogger = (name: string, ctx: Record<string, string> = {}): WinstonLoggingFacade => {
    return new WinstonLoggingFacade(this.logger.child({ "logger.name": name, ...ctx }));
  };

  /**
   * This check can be used when constructing a log statement
   * is expensive and we only need to pay that cost if the
   * log level is enabled.
   */
  isLevelEnabled = (level: LogLevel): boolean => {
    return this.logger.isLevelEnabled(level);
  };
}

export type LoggerMinimumFacade = Pick<WinstonLoggingFacade, "debug" | "error" | "warn" | "log">;
