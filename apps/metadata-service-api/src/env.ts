import z from "zod";
import logger from "./utils/logger";
import { getKeysFromProcessEnv } from "./utils/shared";

export const SupportedChains = ["mainnet", "goerli"] as const;
export type SupportedChain = (typeof SupportedChains)[number];

// check prisma/seed.ts, chainId should match with the network ids in the database
export const SupportedChainId: Record<SupportedChain, number> = {
  mainnet: 1,
  goerli: 5,
};

export const AppEnv = z
  .object({
    CHAIN_ID: z.coerce.number(),
    DATABASE_URL: z.string(),
    MORALIS_API_KEY: z.string(),
  })
  .transform((x) => ({
    ...x,
    RESERVIOR_API_KEYS: {
      mainnet: getKeysFromProcessEnv("RESERVOIR_API_KEY_MAINNET"),
      goerli: getKeysFromProcessEnv("RESERVOIR_API_KEY_GOERLI"),
    },
    LOOKSRARE_API_KEYS: getKeysFromProcessEnv("LOOKSRARE_API_KEY"),
  }))
  .refine(
    (x) =>
      x.RESERVIOR_API_KEYS.mainnet.length >= 1 &&
      x.RESERVIOR_API_KEYS.goerli.length >= 1 &&
      x.LOOKSRARE_API_KEYS.length >= 1
  );

export type AppEnv = z.infer<typeof AppEnv>;

export function getAppEnv(processEnv: unknown = process.env): AppEnv {
  const env = AppEnv.parse(processEnv);

  logger.info("Backend Config", {
    startupTime: Date.now(),
    nodeEnv: process.env.NODE_ENV,
    apiKeys: {
      moralis: env.MORALIS_API_KEY.slice(0, 4) + "...",
      looksrare: env.LOOKSRARE_API_KEYS.length,
      reservoir: {
        mainnet: env.RESERVIOR_API_KEYS.mainnet.length,
        goerli: env.RESERVIOR_API_KEYS.goerli.length,
      },
    },
  });

  return env;
}

export default getAppEnv();
