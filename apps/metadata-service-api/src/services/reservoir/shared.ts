import type { OptionsOfJSONResponseBody } from "got";
import type { HttpClientConfigOverride } from "../httpClient";

/**
 * Executes HTTP requests to Reservoir while respecting "rate-limit" headers coming back
 * from Reservoir. The client correctly follows `x-rate-limit` headers and Status Codes 429.
 * Refer to "got" docs for more info.
 */
export interface ReservoirHttpClient {
  readonly httpClientId: string;
  readonly remaining?: number;
  readonly resetAt?: number;

  makeRequest<T>(path: string, reqOptions?: OptionsOfJSONResponseBody, override?: HttpClientConfigOverride): Promise<T>;
}
