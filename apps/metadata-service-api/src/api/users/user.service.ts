import { SupportedChain } from "src/env";
import external from "src/services";

const getUserTokens = async (chain: SupportedChain, account: string, collection?: string, continuation?: string) => {
  return external.reservoirApi.requestUserTokens(chain, account, collection, continuation);
};

export default {
  getUserTokens,
};
