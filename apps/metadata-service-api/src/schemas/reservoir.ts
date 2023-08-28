import { z } from "zod";
import { EthAddress } from "./common";

// https://docs.reservoir.tools/reference/getcollectionsv5
export const ReservoirCollection = z.object({
  id: EthAddress,
  slug: z.string(),
  name: z.string(),
  createdAt: z.string().datetime(),
  image: z.string().url(),
  banner: z.string().url().nullable(),
  discordUrl: z.string().url().optional().nullable(),
  externalUrl: z.string().url().optional().nullable(),
  twitterUsername: z.string().optional().nullable(),
  openseaVerificationStatus: z.string(), // 'verified', 'disabled_top_trending'
  description: z.string().nullable(),
  tokenCount: z.coerce.number(),
  onSaleCount: z.coerce.number(),
  primaryContract: EthAddress,
  rank: z.object({
    "1day": z.number().nullable(),
    "7day": z.number().nullable(),
    "30day": z.number().nullable(),
    allTime: z.number().nullable(),
  }),
});
export type ReservoirCollection = z.infer<typeof ReservoirCollection>;

export const ReservoirCollectionResponse = z.object({
  collections: z.array(ReservoirCollection),
});
export type ReservoirCollectionResponse = z.infer<typeof ReservoirCollectionResponse>;

// https://docs.reservoir.tools/reference/gettokensv5
export const ReservoirToken = z.object({
  contract: EthAddress,
  tokenId: z.coerce.number().transform((id) => id.toString()),
  name: z.string().nullable(),
  description: z.string().nullable(),
  image: z.string().url().nullable(),
  media: z.string().url().nullable(),
  kind: z.enum(["erc721", "erc1155"]),
  isFlagged: z.boolean(),
  lastFlagUpdate: z.string().datetime(),
  rarity: z.coerce.number().transform((id) => id.toString()),
  rarityRank: z.coerce.number().transform((id) => id.toString()),
  owner: EthAddress,
});
export type ReservoirToken = z.infer<typeof ReservoirToken>;

export const ReservoirTokenResponse = z.object({
  tokens: z.array(
    z.object({
      token: ReservoirToken,
      market: z.object({}),
    })
  ),
  continuation: z.string().nullable(),
});
export type ReservoirTokenResponse = z.infer<typeof ReservoirTokenResponse>;
