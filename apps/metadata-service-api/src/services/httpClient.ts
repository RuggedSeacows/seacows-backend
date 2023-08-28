import type { ExtendOptions, Got, OptionsOfJSONResponseBody, Response, RequestError, NormalizedOptions } from "got";
import got from "got";
import { attemptParseJson } from "../utils/shared";
import { SharedHttpAgents } from "../utils/constants";
import logger from "../utils/logger";
import { SupportedChain } from "src/env";

export class HttpClientError extends Error {
  public name = "HttpClientError";

  constructor() {
    super();
  }
}

export class HttpRateLimitedError extends HttpClientError {
  public readonly name = "HttpRateLimitedError";

  constructor() {
    super();
  }
}

export class HttpUnknownError extends HttpClientError {
  public readonly name = "HttpUnknownError";

  constructor() {
    super();
  }
}

export type HttpClientConfig = {
  readonly baseUrl: string;
  readonly defaultHeaders: Record<string, string>;
};

export type HttpClientConfigOverride = {
  readonly chain?: SupportedChain;
  readonly baseUrl?: string;
};

export class HttpClientWithRetries {
  protected readonly logger = logger.childLogger("HttpClientWithRateLimitRetries");

  protected readonly defaultGotOptions: ExtendOptions = {
    throwHttpErrors: false,
    retry: {
      limit: 6,
      maxRetryAfter: 60 * 1000,
    },
    allowGetBody: true,
    agent: {
      http: SharedHttpAgents.HTTP,
      https: SharedHttpAgents.HTTPS,
    },
    hooks: {
      beforeRetry: [
        (options: NormalizedOptions, error?: RequestError, retryCount?: number): void => {
          this.logger.warn(`Retrying [${retryCount ?? 0} of ${options.retry.limit}]: ${error?.code ?? "Unknown"}`);
        },
      ],
    },
  };

  protected readonly gotInstance: Got = got.extend(this.defaultGotOptions);

  constructor(protected readonly config?: Partial<HttpClientConfig>) {
    this.config = Object.assign({ defaultHeaders: {} }, config);

    this.gotInstance = this.gotInstance.extend({
      prefixUrl: this.config.baseUrl,
      headers: this.config.defaultHeaders,
    });
  }

  private processResponse<T>(response: Response<T>, path: string) {
    const { statusCode, body, headers, retryCount } = response;

    if (statusCode === 200) {
      return attemptParseJson<T>(body);
    } else if (statusCode === 429) {
      this.logger.warn("makeRequest:RateLimited", { statusCode, path, headers, retryCount });
      throw new HttpRateLimitedError();
    } else {
      this.logger.error("makeRequest:RequestFailed", { statusCode, path, headers, body });
      throw new HttpUnknownError();
    }
  }

  /**
   * Execute HTTP requests
   * This respects the "rate-limit" headers by default as defined in `defaultGotOptions` above.
   */
  async makeRequest<T>(
    path: string,
    reqOptions: OptionsOfJSONResponseBody = {},
    override?: HttpClientConfigOverride
  ): Promise<T> {
    const got = override?.baseUrl
      ? this.gotInstance.extend({
          prefixUrl: override.baseUrl,
        })
      : this.gotInstance;

    const response = await got<T>(path, reqOptions);
    return this.processResponse<T>(response, path);
  }
}
