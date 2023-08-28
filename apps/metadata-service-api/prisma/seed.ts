import { Prisma, PrismaClient } from "@prisma/client";
import { constants } from "ethers";

const prisma = new PrismaClient();

async function main() {
  await prisma.wallet.createMany({
    data: [
      {
        id: 1,
        address: constants.AddressZero,
      },
    ],
  });

  await prisma.currency.createMany({
    data: [
      {
        id: 1,
        address: constants.AddressZero,
        name: "Native Token",
        symbol: "ETH",
        decimals: 18,
      },
    ],
  });

  await prisma.network.createMany({
    data: [
      {
        id: 1,
        name: "Ethereum Mainnet",
        currencyAddress: constants.AddressZero,
      },
      {
        id: 5,
        name: "Goerli",
        currencyAddress: constants.AddressZero,
      },
    ],
  });
}

main()
  .then(() => {
    console.info("Finished seeding data.");
  })
  .catch((error) => {
    console.error(error);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
