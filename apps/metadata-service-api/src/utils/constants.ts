import HttpAgent, { HttpsAgent } from "agentkeepalive";

/**
 * Timings for repeated jobs
 */
const HOUR_MS = 1 * 60 * 60 * 1000;

export const MINS_30_MS = HOUR_MS / 2;
export const HOURS_12_MS = 12 * HOUR_MS;
export const DAYS_3_MS = 3 * 24 * HOUR_MS;

/**
 * Setup and connect to queue service with rate limits as pre-defined
 * by Reservoir rate-limit-documentation.
 */
export const ReservoirConfig = {
  BASE_API_URL: {
    mainnet: "https://api.reservoir.tools/",
    goerli: "https://api-goerli.reservoir.tools/",
  },
  DEFAULT_REQ_RATE_LIMIT_PER_CLIENT: 60,
  RATE_LIMIT_WINDOW_MS: 1 * 60 * 1000,
};

export const LooksRareConfig = {
  BASE_API_URL: {
    mainnet: "https://api.looksrare.org/",
    goerli: "https://api-goerli.looksrare.org/",
  },
  DEFAULT_REQ_RATE_LIMIT_PER_CLIENT: 60,
  RATE_LIMIT_WINDOW_MS: 1 * 60 * 1000,
};

/**
 * Shared HTTP & HTTPs agents for connection pooling.
 */
export const SharedHttpAgents = {
  HTTP: new HttpAgent(),
  HTTPS: new HttpsAgent(),
};
