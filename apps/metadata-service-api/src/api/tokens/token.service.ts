import external from "src/services";
import env, { SupportedChain, SupportedChainId } from "src/env";
import { QueryTokensArgs } from "./token.schema";

const queryTokensWithMoralis = async (chain: SupportedChain, args: QueryTokensArgs) => {
  const response = await external.moralisNftApi.searchNFTs({
    chain: SupportedChainId[chain],
    format: "decimal",
    addresses: [],
    ...args,
  });

  return response.raw;
};

export default {
  queryTokensWithMoralis,
};
