import type { OptionsOfJSONResponseBody } from "got";
import type { LooksRareHttpClient } from "./shared";
import { shuffle } from "lodash";
import logger from "../../utils/logger";
import { LooksRareHttpClientWithRateLimitRetries } from "./httpRateLimitClient";

/**
 * Manages a set of LooksRare Http Clients to distribute requests across multiple
 * api-keys to increase the overall request limits of the service and throughput.
 */
export class LooksRareHttpClientManager {
  private readonly logger = logger.childLogger("LooksRareHttpClientManager");
  readonly httpClientId = "LooksRareHttpClientManager";

  private httpClients: Map<string, LooksRareHttpClient> = new Map();

  constructor(apiKeys: string[]) {
    for (const key of shuffle(apiKeys)) {
      const client = new LooksRareHttpClientWithRateLimitRetries({ defaultHeaders: { "x-api-key": key } });
      this.httpClients.set(client.httpClientId, client);
    }
  }

  // Compare the remaining rate-limit available on a http client to order the clients
  // by most rate-limit remaining descending.
  private compare(client1: LooksRareHttpClient, client2: LooksRareHttpClient): number {
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
  private sortMap() {
    const sortedMap: Array<readonly [string, LooksRareHttpClient]> = [...this.httpClients.values()]
      .sort((a, b) => this.compare(a, b))
      .map((x) => [x.httpClientId, x] as const);

    this.httpClients = new Map(sortedMap);

    this.logger.debug("SortedMap rate remaining httpClients.", {
      clients: sortedMap.map((x) => [x[0], x[1].remaining]),
    });
  }

  private getHttpClient(): LooksRareHttpClient {
    const clients = [...this.httpClients.values()];
    return clients[0];
  }

  /**
   * Execute HTTP requests distributed acrosss many HTTP clients.
   * This respects the "rate-limit" headers by default as defined in `defaultGotOptions` above.
   */
  async makeRequest<T>(path: string, reqOptions?: OptionsOfJSONResponseBody): Promise<T> {
    try {
      const client = this.getHttpClient();
      this.logger.log("clientId: " + client.httpClientId);

      const response = await client.makeRequest<T>(path, reqOptions);

      this.sortMap();

      return response;
    } catch (error) {
      // Even in a failure case we still want to make sure we are re-sorting the map
      // since a request will have been used and `remaining` will be updated. Then just re-throw.
      this.sortMap();

      this.logger.info("SortedMap rate remaining httpClients.", {
        clients: [...this.httpClients.entries()].map((x) => [x[0], x[1].remaining]),
      });

      throw error as Error;
    }
  }
}
