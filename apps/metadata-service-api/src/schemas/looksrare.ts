import { z } from "zod";
import { EthAddress, ZodBigNumber } from "./common";

// https://looksrare.dev/reference/getcollectionbyaddress
export const LooksRareCollection = z.object({
  address: EthAddress,
  owner: EthAddress.nullable(),
  setter: EthAddress.nullable(),
  admin: EthAddress.nullable(),
  name: z.string(),
  description: z.string(),
  type: z.enum(["ERC721", "ERC1155"]),
  symbol: z.string(),
  logoURI: z.string().url().nullable(),
  bannerURI: z.string().url().nullable(),
  isVerified: z.boolean(),
  isExplicit: z.boolean(),
  websiteLink: z.string().url().nullable(),
  facebookLink: z.string().url().nullable(),
  twitterLink: z.string().url().nullable(),
  instagramLink: z.string().url().nullable(),
  telegramLink: z.string().url().nullable(),
  mediumLink: z.string().url().nullable(),
  discordLink: z.string().url().nullable(),
});
export type LooksRareCollection = z.infer<typeof LooksRareCollection>;

export const LooksRareCollectionResponse = z.object({
  success: z.boolean(),
  message: z.string().nullable(),
  data: LooksRareCollection.nullable(),
});
export type LooksRareCollectionResponse = z.infer<typeof LooksRareCollectionResponse>;

export const LooksRareTokenAttribute = z.object({
  traitType: z.string(),
  value: z.string(),
  displayType: z.string(),
  count: z.string(),
  floorOrder: z.any().nullable(),
});

// https://looksrare.dev/reference/getcollectiontoken
export const LooksRareToken = z.object({
  id: ZodBigNumber,
  collectionAddress: EthAddress,
  tokenId: ZodBigNumber,
  tokenURI: z.string().url().nullable(),
  name: z.string(),
  description: z.string(),
  isVerified: z.boolean(),
  isAnimated: z.boolean(),
  attributes: z.array(LooksRareTokenAttribute),
});

export type LooksRareToken = z.infer<typeof LooksRareToken>;
export type LooksRareTokenAttribute = z.infer<typeof LooksRareTokenAttribute>;

export const LooksRareTokenResponse = z.object({
  success: z.boolean(),
  message: z.string().nullable(),
  data: LooksRareToken.nullable(),
});
export type LooksRareTokenResponse = z.infer<typeof LooksRareTokenResponse>;
