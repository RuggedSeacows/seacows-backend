import { constants } from "ethers";
import { Prisma } from "@prisma/client";
import prisma from "src/utils/prisma";
import external from "src/services";
import { ReservoirTokenResponse } from "src/schemas/reservoir";
import { SupportedChain, SupportedChainId } from "src/env";

const getCollection = async (chain: SupportedChain, collectionAddress: string) => {
  const collection = await prisma.read.collection.findUnique({
    where: {
      networkId_address: {
        networkId: SupportedChainId[chain],
        address: collectionAddress,
      },
    },
  });

  if (collection) {
    return collection;
  }

  const { collections } = await external.reservoirApi.requestCollections(chain, collectionAddress);
  const rCollection = collections[0];
  const networkId = SupportedChainId[chain];

  const created = await prisma.write.collection.create({
    data: {
      address: collectionAddress,
      isVerified: rCollection.openseaVerificationStatus === "verified",
      osSlug: rCollection.slug,
      name: rCollection.name,
      description: rCollection.description,
      logo: rCollection.image,
      banner: rCollection.banner,
      websiteLink: rCollection.externalUrl,
      twitterLink: rCollection.twitterUsername,
      type: "ERC721",
      owner: {
        // TODO: Use LooksRare API to fill in owner information
        connect: {
          address: constants.AddressZero,
        },
      },
      createdAt: rCollection.createdAt,
      network: {
        connect: {
          id: networkId,
        },
      },
    },
  });

  return created;
};

const saveReservoirCollectionTokens = (collectionId: number, tokens: ReservoirTokenResponse["tokens"]) => {
  return prisma.write.token.createMany({
    data: tokens.map(({ token }) => ({
      tokenId: new Prisma.Decimal(token.tokenId),
      collectionId,
      name: token.name || `#${token.tokenId}`,
      image: token.image,
      flagId: token.isFlagged ? 1 : 0,
      description: token.description,
    })),
  });
};

const getCollectionAllTokens = async (chain: SupportedChain, collectionAddress: string) => {
  const collection = await getCollection(chain, collectionAddress);
  const tokens = await external.reservoirApi.requestMaxTokens(chain, collectionAddress, undefined, (tokens) =>
    saveReservoirCollectionTokens(collection.id, tokens)
  );

  return tokens;
};

const getCollectionTokens = async (chain: SupportedChain, collectionAddress: string, tokenIds: string[]) => {
  const collection = await getCollection(chain, collectionAddress);

  if (!collection) {
    return {
      tokens: [],
      continuation: null,
    };
  }

  // TODO: Find tokens and read from our db
  // const dbTokens = await prisma.read.token.findMany({
  //   where: {
  //     collectionId: collection.id,
  //     tokenId: {
  //       in: tokenIds.map(id => new Prisma.Decimal(id))
  //     }
  //   }
  // })

  const tokens = await external.reservoirApi.requestMultipleCollectionTokens(chain, collectionAddress, tokenIds);

  return tokens;
};

const searchCollections = async (chain: SupportedChain, name: string) => {
  return external.reservoirApi.searchCollections(chain, name);
};

const getTrendingCollections = async (chain: SupportedChain) => {
  return external.reservoirApi.requestMultipleCollections(chain, "30DayVolume", 12);
};

export default {
  getCollection,
  searchCollections,
  getCollectionTokens,
  getCollectionAllTokens,
  getTrendingCollections,
};
