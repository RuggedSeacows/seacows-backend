import { gql } from "graphql-request";
import { graphql } from "./client";

interface PaginatedInput {
  skip?: number;
  first?: number;
}

interface PoolInput extends PaginatedInput {
  where: {
    collections: string[];
  };
}

interface AmmPool {
  id: string;
  collection: {
    id: string;
    name: string;
  };
}

export const getAmmPools = async (
  { skip = 0, first = 1000, where }: PoolInput,
  requestHeaders?: HeadersInit
): Promise<AmmPool[]> => {
  const query = gql`
    query GetAMMPositions($where: Pool_filter, $skip: Int, $first: Int) {
      pools(first: $first, skip: $skip, where: $where) {
        id
        collection {
          id
          name
        }
      }
    }
  `;

  const res = await graphql<{ pools: AmmPool[] }>(
    query,
    {
      where: {
        collection_in: where.collections,
      },
      skip,
      first,
    },
    requestHeaders
  );
  return res.pools;
};
