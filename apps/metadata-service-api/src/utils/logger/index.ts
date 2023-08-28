import winston from "winston";
import { loggerConfig } from "./config";
import { WinstonLoggingFacade } from "./facade";

/**
 * Bind the internal winston logger to a singleton export in package utilising the logger export.
 */
function bindLogger(tags: Record<string, string> = {}): WinstonLoggingFacade {
  const winstonLogger = winston.createLogger(loggerConfig(tags));

  return new WinstonLoggingFacade(winstonLogger);
}

export default bindLogger({
  service: "backend",
});
