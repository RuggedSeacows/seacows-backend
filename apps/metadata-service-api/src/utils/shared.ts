import logger from "./logger";

/**
 * Attempt to safely parse an unknown JSON response.
 */
export function attemptParseJson<T>(data: unknown): T {
  const maybeString = data as string;
  return JSON.parse(maybeString) as T;
}

/**
 * Gets a list of api keys of `n` length from process.env.
 * Follows "KEY_PREFIX_*" environment variable naming convention.
 */
export function getKeysFromProcessEnv(keyPrefix: string): string[] {
  const env = Object.entries(process.env);
  const keys = env.filter(([key, value]) => key.startsWith(`${keyPrefix}_`) && value);

  return keys.map(([_, value]) => value as string);
}
