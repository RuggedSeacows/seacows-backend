import type { ReservoirHttpClient } from "./shared";
import type { paths } from "@reservoir0x/reservoir-sdk";
import type { ReservoirToken } from "../../schemas/reservoir";
import { ReservoirCollectionResponse, ReservoirTokenResponse } from "../../schemas/reservoir";
import logger from "../../utils/logger";
import { ReservoirConfig } from "../../utils/constants";
import { SupportedChain } from "src/env";

type TokenSortBy = "tokenId" | "floorAskPrice" | "rarity";

type ExploreAttributesResponse =
  paths["/collections/{collection}/attributes/explore/v4"]["get"]["responses"]["200"]["schema"];
type MultipleCollectionsResponse = paths["/collections/v5"]["get"]["responses"]["200"]["schema"];
type UserTokensResponse = paths["/users/{user}/tokens/v6"]["get"]["responses"]["200"]["schema"];
type GetTokensResponse = paths["/tokens/v6"]["get"]["responses"]["200"]["schema"];
type CollectionAllAttributesResponse =
  paths["/collections/{collection}/attributes/all/v3"]["get"]["responses"]["200"]["schema"];
type SearchCollectionsResponse = paths["/search/collections/v1"]["get"]["responses"]["200"]["schema"];

export class ReservoirHttpApi {
  private readonly logger = logger.childLogger("ReservoirHttpApi");
  constructor(private readonly ReservoirHttpClient: ReservoirHttpClient) {}

  async requestUserTokens(
    chain: SupportedChain,
    account: string,
    collection?: string,
    continuation?: string
  ): Promise<UserTokensResponse> {
    const data = await this.ReservoirHttpClient.makeRequest<UserTokensResponse>(
      `users/${account}/tokens/v6`,
      {
        searchParams: {
          collection,
          continuation,
          limit: 200,
        },
      },
      { chain }
    );

    return data;
  }

  async searchCollections(chain: SupportedChain, name: string) {
    // https://docs.reservoir.tools/reference/getsearchcollectionsv1
    const data = await this.ReservoirHttpClient.makeRequest<SearchCollectionsResponse>(
      `search/collections/v1`,
      {
        searchParams: {
          name,
          // offset
          // limit (Default 20)
        },
      },
      { chain }
    );

    return data;
  }

  async requestCollections(chain: SupportedChain, collectionId: string): Promise<ReservoirCollectionResponse> {
    const data = await this.ReservoirHttpClient.makeRequest(
      "collections/v5",
      {
        searchParams: {
          id: collectionId,
        },
      },
      { chain }
    );

    const parsed = ReservoirCollectionResponse.safeParse(data);

    if (parsed.success) {
      return parsed.data;
    } else {
      console.error("ReservoirCollectionResponse parse error", {
        data,
        error: parsed.error,
      });

      return data as ReservoirCollectionResponse;
    }
  }

  async requestCollectionAllAttributes(
    chain: SupportedChain,
    collection: string
  ): Promise<CollectionAllAttributesResponse> {
    const data = await this.ReservoirHttpClient.makeRequest<CollectionAllAttributesResponse>(
      `collection/${collection}/attributes/all/v3`,
      {},
      { chain }
    );

    return data;
  }

  async requestMultipleCollectionTokens(chain: SupportedChain, collection: string, tokenIds: string[]) {
    const searchParams = new URLSearchParams([
      ["includeAttributes", "true"],
      ...tokenIds.map((id) => ["tokens", `${collection}:${id}`]),
    ]);

    console.log("searchParams", searchParams.toString());

    const data = await this.ReservoirHttpClient.makeRequest<GetTokensResponse>(
      `tokens/v6`,
      {
        searchParams,
      },
      { chain }
    );

    return data;
  }

  async requestMultipleCollections(
    chain: SupportedChain,
    sortBy: "1DayVolume" | "7DayVolume" | "1DayVolume" | "30DayVolume" | "allTimeVolume" | "createdAt",
    limit = 20,
    continuation?: string
  ) {
    const data = await this.ReservoirHttpClient.makeRequest<MultipleCollectionsResponse>(
      "collections/v5",
      {
        searchParams: {
          sortBy,
          limit,
          continuation,
        },
      },
      { chain }
    );

    return data;
  }

  async requestTokenAttributes(chain: SupportedChain, collectionId: string, tokenId: string) {
    const data = await this.ReservoirHttpClient.makeRequest<ExploreAttributesResponse>(
      `collections/${collectionId}/attributes/explore/v4`,
      {
        searchParams: {
          tokenId,
        },
      },
      { chain }
    );

    return data;
  }

  private async requestCollectionTokens(
    chain: SupportedChain,
    collectionId: string,
    sortBy: TokenSortBy = "tokenId",
    continuation?: string
  ): Promise<ReservoirTokenResponse> {
    const data = await this.ReservoirHttpClient.makeRequest(
      "tokens/v5",
      {
        searchParams: {
          contract: collectionId,
          sortBy,
          limit: 100,
          // Use continuation token to request next offset of items
          continuation,
        },
      },
      { chain }
    );

    return ReservoirTokenResponse.parse(data);
  }

  /**
   * Fetch tokens for a given collection through paginated API calls. Calls are done recursively
   */
  async requestMaxTokens(
    chain: SupportedChain,
    collectionId: string,
    continuation?: string,
    callback?: (tokens: ReservoirTokenResponse["tokens"]) => unknown
  ): Promise<ReservoirToken[]> {
    const { continuation: continueToken, tokens } = await this.requestCollectionTokens(
      chain,
      collectionId,
      "tokenId",
      continuation
    );

    if (callback) {
      callback(tokens);
    }

    if (continueToken) {
      this.logger.log("Requesting next tokens.", {
        chain,
        continuation: continueToken,
        collectionId,
        tokens: tokens.length,
      });
      const nextTokens = await this.requestMaxTokens(chain, collectionId, continueToken);

      return tokens.map((t) => t.token).concat(nextTokens);
    } else {
      return tokens.map((t) => t.token);
    }
  }
}
