import { utils } from "ethers";

export const checksumAddress = (address: string) => {
  try {
    return utils.getAddress(address.toLowerCase());
  } catch {}

  return address;
};
