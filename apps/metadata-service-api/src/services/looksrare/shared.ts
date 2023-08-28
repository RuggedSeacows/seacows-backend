import type { OptionsOfJSONResponseBody } from "got";

/**
 * Executes HTTP requests to LooksRare while respecting "ratelimit" headers coming back
 * from LooksRare. The client correctly follows `ratelimit` headers and Status Codes 429.
 * Refer to "got" docs for more info.
 */
export interface LooksRareHttpClient {
  readonly httpClientId: string;
  readonly remaining?: number;
  readonly resetAt?: number;

  makeRequest<T>(path: string, reqOptions?: OptionsOfJSONResponseBody): Promise<T>;
}
