import Moralis from "moralis";

export function initMoralis(apiKey: string) {
  return Moralis.start({
    apiKey,
  });
}
