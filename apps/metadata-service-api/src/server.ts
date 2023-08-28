import { initApp } from "./app";
import logger from "./utils/logger";
import { AppEnv, getAppEnv } from "./env";
import external from "src/services";
import CollectionService from "src/api/collections/collection.service";
import { initMoralis } from "./services/moralis";

async function main() {
  const port = process.env.PORT || 3001;
  const env = getAppEnv();

  await initMoralis(env.MORALIS_API_KEY);

  const app = initApp();

  // test
  app.listen(port, () => logger.log(`Example app listening at http://localhost:${port}`));

  // Reservoir APIs
  // const collections = await external.reservoirApi.requestMultipleCollections("30DayVolume", 1);

  // for await (const collection of (collections.collections || [])) {
  //   const address = collection.id;

  //   console.log('Get collection', collection)

  //   if (!address) {
  //     console.log('Collection address empty', collection)
  //     continue;
  //   }

  //   await CollectionService.getCollectionTokens(address);
  // }
}

main().catch((error: Error) => {
  logger.fatal("Backend server failed:", { error: error.message });
});
