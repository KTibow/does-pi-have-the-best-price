import { getAvailability } from "$lib/pi";
import type { Price } from "./types";

export const load = async () => {
  const piCommunityPrices: Record<string, Price> = {};
  const piSecurePrices: Record<string, Price> = {};
  for (const [gpu, entries] of Object.entries(await getAvailability())) {
    for (const entry of entries) {
      if (entry.prices.currency != "USD") continue;
      if (
        entry.prices.communityPrice &&
        (piCommunityPrices[gpu]?.price || Infinity > entry.prices.communityPrice)
      ) {
        piCommunityPrices[gpu] = {
          price: entry.prices.communityPrice,
          provider: entry.provider,
        };
      }
      if (
        entry.prices.onDemand &&
        (piSecurePrices[gpu]?.price || Infinity > entry.prices.onDemand)
      ) {
        piSecurePrices[gpu] = {
          price: entry.prices.onDemand,
          provider: entry.provider,
        };
      }
    }
  }
  // const deepinfraPrices = { B200_180GB: 2.49 }
  return { piCommunityPrices, piSecurePrices };
};
