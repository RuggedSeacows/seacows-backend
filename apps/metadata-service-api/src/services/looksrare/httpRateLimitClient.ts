import type { ExtendOptions, Got, Response } from "got";
import type { HttpClientConfig } from "../httpClient";
import { z } from "zod";
import got from "got";
import logger from "../../utils/logger";
import { HttpClientWithRetries } from "../httpClient";
import { SharedHttpAgents, LooksRareConfig } from "../../utils/constants";

export class LooksRareHttpClientWithRateLimitRetries extends HttpClientWithRetries {
  constructor(protected readonly config?: Partial<HttpClientConfig>) {
    super(config);

    this.config = Object.assign({ baseUrl: LooksRareConfig.BASE_API_URL.mainnet, defaultHeaders: {} }, config);

    this.gotInstance = this.gotInstance.extend({
      // Base URL of the API.
      // Inner-methods should only need to specify the "path".
      prefixUrl: this.config.baseUrl,
      // Specify any default headers that need to be set.
      // Can be used for "auth-headers" if any.
      headers: this.config.defaultHeaders,
    });
  }

  // For simple internal identification of http clients assign a hashed version of the apiKey as the client id
  private readonly key = z.string().parse(this.config?.defaultHeaders?.["x-api-key"] || "default-api-key");
  public readonly httpClientId: string = `****${this.key.slice(this.key.length - 5, this.key.length)}`;

  // Initialize clients assuming they have 20% of their requests exhausted.
  // This will be updated to an accurate value once the first request is made.
  public resetAt: number = Date.now() + LooksRareConfig.RATE_LIMIT_WINDOW_MS;
  public remaining: number = LooksRareConfig.DEFAULT_REQ_RATE_LIMIT_PER_CLIENT * 0.8;

  protected readonly logger = logger.childLogger("LooksRareHttpClientWithRateLimitRetries", {
    client: this.httpClientId,
  });

  protected readonly defaultGotOptions: ExtendOptions = {
    throwHttpErrors: false,
    agent: {
      http: SharedHttpAgents.HTTP,
      https: SharedHttpAgents.HTTPS,
    },
    retry: {
      limit: 3,
      calculateDelay: ({ attemptCount, retryOptions }): number => {
        // Fail fast if we reach retry limit
        if (attemptCount > retryOptions.limit || this.remaining === -1) {
          return 0;
        }

        // On first retry attempt only we should schedule the retry for when
        // the rate-limit is expected to reset.
        if (this.resetAt > Date.now() && attemptCount <= 1) {
          const retryAfterMs = this.resetAt - Date.now();
          this.logger.info("Retrying request at resetAt.", { retryAfterMs });

          return retryAfterMs;
        }
        // On any subsequent retries we want to just default to a exponential backoff
        // timing function so we don't accidentally wait for another 15 minutes.
        else {
          return 2 ** (attemptCount - 1) * 1000;
        }
      },
    },
    hooks: {
      afterResponse: [
        (response: Response<unknown>): Response<unknown> => {
          const limit = Number(response.headers["ratelimit-limit"]);
          const remaining = Number(response.headers["ratelimit-remaining"]);
          const resetAt = Number(response.headers["ratelimit-reset"]) * 1000;

          this.remaining = remaining;
          this.resetAt = resetAt;

          if (isNaN(limit) || isNaN(remaining)) {
            this.logger.error(`Rate limit format doesn't match for LooksRare API`, {
              headers: response.headers,
            });
          }

          if (response.statusCode === 429) {
            // If we exhaust a key's limit for the month we need to make sure we don't assign
            // requests to that key as they will be rate-limited even though there the headers show
            // there is use remaining.
            if (limit === 40_000) {
              this.remaining = -1;
              this.logger.error(`RateLimited. Monthly use exhausted.`, { remaining, resetAt, id: this.httpClientId });
            } else {
              this.logger.warn("RateLimited.", { remaining: 0, resetAt });
            }
          }

          return response;
        },
      ],
    },
  };

  protected readonly gotInstance: Got = got.extend(this.defaultGotOptions);
}
