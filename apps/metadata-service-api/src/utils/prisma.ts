import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import logger from "src/utils/logger";
import env from "src/env";

export interface PrismaConfig {
  read: PrismaClient;
  write: PrismaClient;
}

// Ensure we emit prisma logs as events so we can manually
// direct the logs to our custom logging interface. Excludes `query` logs.
export const prismaLogLevels: Prisma.LogDefinition[] = [
  { level: "info", emit: "event" },
  { level: "warn", emit: "event" },
  { level: "error", emit: "event" },
  { level: "query", emit: "event" },
];

const createPrismaWithLogger = (url: string) => {
  const client = new PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>({
    datasources: { db: { url } },
    log: prismaLogLevels,
  });

  prismaLogLevels.forEach(({ level }) => {
    client.$on(level, (event) => {
      const logLevel = level === "query" ? "debug" : level === "info" ? "log" : level;
      const message = "message" in event ? event.message : "Prisma Query Event";

      logger[logLevel](message, { event, "logger.name": "prisma" });
    });
  });

  return client;
};

export const getPrisma = (readUrl?: string, writeUrl?: string): PrismaConfig => {
  if (!readUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const defaultClient = createPrismaWithLogger(readUrl);

  if (process.env.NODE_ENV === "production") {
    if (!writeUrl) {
      throw new Error("DATABASE_WRITE_URL is required.");
    }

    return {
      read: defaultClient,
      write: createPrismaWithLogger(writeUrl),
    };
  }

  return {
    read: defaultClient,
    write: defaultClient,
  };
};

export default getPrisma(env.DATABASE_URL, env.DATABASE_URL);
