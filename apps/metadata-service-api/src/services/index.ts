import Moralis from "moralis";
import { LooksRareHttpApi } from "./looksrare/httpApi";
import env, { SupportedChain } from "src/env";
import { ReservoirHttpApi } from "./reservoir/httpApi";
import { ReservoirHttpClientManager } from "./reservoir/httpClientManager";
import { LooksRareHttpClientManager } from "./looksrare/httpClientManager";

export interface ExternalServices {
  reservoirApi: ReservoirHttpApi;
  looksrareApi: LooksRareHttpApi;
  moralisNftApi: typeof Moralis.EvmApi.nft;
}

export class ExternalServices implements ExternalServices {
  private constructor(reservoirApiKeys: Record<SupportedChain, string[]>, looksrareApiKeys: string[]) {
    const reservoirHttpClient = new ReservoirHttpClientManager(reservoirApiKeys);
    const looksRareHttpClient = new LooksRareHttpClientManager(looksrareApiKeys);

    this.reservoirApi = new ReservoirHttpApi(reservoirHttpClient);
    this.looksrareApi = new LooksRareHttpApi(looksRareHttpClient);
    this.moralisNftApi = Moralis.EvmApi.nft;
  }

  static apply(reservoirApiKeys: Record<SupportedChain, string[]>, looksrareApiKeys: string[]): ExternalServices {
    return new ExternalServices(reservoirApiKeys, looksrareApiKeys);
  }
}

export default ExternalServices.apply(env.RESERVIOR_API_KEYS, env.LOOKSRARE_API_KEYS);
