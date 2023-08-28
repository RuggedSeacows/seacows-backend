import type { OptionsOfJSONResponseBody } from "got";
import type { ReservoirHttpClient } from "./shared";
import { shuffle } from "lodash";
import logger from "../../utils/logger";
import { ReservoirHttpClientWithRateLimitRetries } from "./httpRateLimitClient";
import { HttpClientConfigOverride } from "../httpClient";
import { SupportedChain, SupportedChains } from "src/env";
import { ReservoirConfig } from "src/utils/constants";

/**
 * Manages a set of Reservoir Http Clients to distribute requests across multiple
 * api-keys to increase the overall request limits of the service and throughput.
 */
export class ReservoirHttpClientManager {
  private readonly logger = logger.childLogger("ReservoirHttpClientManager");
  readonly httpClientId = "ReservoirHttpClientManager";
  private readonly defaultChain: SupportedChain = "mainnet";

  private httpClients: Record<SupportedChain, Map<string, ReservoirHttpClient>> = {
    mainnet: new Map(),
    goerli: new Map(),
  };

  constructor(apiKeys: Record<SupportedChain, string[]>) {
    for (const chain of SupportedChains) {
      for (const key of shuffle(apiKeys[chain])) {
        const client = new ReservoirHttpClientWithRateLimitRetries({ defaultHeaders: { "x-api-key": key } });
        this.httpClients[chain].set(client.httpClientId, client);
      }
    }
  }

  // Compare the remaining rate-limit available on a http client to order the clients
  // by most rate-limit remaining descending.
  private compare(client1: ReservoirHttpClient, client2: ReservoirHttpClient): number {
    const val1 = client1?.remaining ?? 0;
    const val2 = client2?.remaining ?? 0;

    return val1 > val2 ? -1 : 1;
  }

  // Used for sorting the list of http clients so we can simply access zero index when
  // "getting" the http client which is guaranteed to have the most rate limit available.
  // The logic is that we use the client with most requests available to it at any given time
  // which gives other clients more time to reset their rate limits. If all clients have equal
  // remaining rate limit then it will cycle through those clients one request at a time
  // evenly distributing the clients.
  private sortMap(chain: SupportedChain) {
    const sortedMap: Array<readonly [string, ReservoirHttpClient]> = [...this.httpClients[chain].values()]
      .sort((a, b) => this.compare(a, b))
      .map((x) => [x.httpClientId, x] as const);

    this.httpClients[chain] = new Map(sortedMap);

    this.logger.debug("SortedMap rate remaining httpClients.", {
      clients: sortedMap.map((x) => [x[0], x[1].remaining]),
    });
  }

  private getHttpClient(chain: SupportedChain): ReservoirHttpClient {
    const clients = [...this.httpClients[chain].values()];
    return clients[0];
  }

  /**
   * Execute HTTP requests distributed acrosss many HTTP clients.
   * This respects the "rate-limit" headers by default as defined in `defaultGotOptions` above.
   */
  async makeRequest<T>(
    path: string,
    reqOptions?: OptionsOfJSONResponseBody,
    override?: HttpClientConfigOverride
  ): Promise<T> {
    const chain = override?.chain || this.defaultChain;
    try {
      const client = this.getHttpClient(chain);
      this.logger.log("clientId: " + client.httpClientId);

      const response = await client.makeRequest<T>(path, reqOptions, {
        baseUrl: ReservoirConfig.BASE_API_URL[chain],
      });

      this.sortMap(chain);

      return response;
    } catch (error) {
      // Even in a failure case we still want to make sure we are re-sorting the map
      // since a request will have been used and `remaining` will be updated. Then just re-throw.
      this.sortMap(chain);

      this.logger.info("SortedMap rate remaining httpClients.", {
        clients: [...this.httpClients[chain].entries()].map((x) => [x[0], x[1].remaining]),
      });

      throw error as Error;
    }
  }
}
