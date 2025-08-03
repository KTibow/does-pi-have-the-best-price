import { getAvailability } from "$lib/pi";
import type { Price } from "./types";

export const load = async () => {
  const piPrices: Record<string, Price> = {};
  const piSecurePrices: Record<string, Price> = {};
  for (const [gpu, entries] of Object.entries(await getAvailability())) {
    for (const entry of entries) {
      if (entry.prices.currency != "USD") continue;
      const minPrice = Math.min(
        entry.prices.communityPrice || Infinity,
        entry.prices.onDemand || Infinity,
      );
      if (minPrice && (piPrices[gpu]?.price || Infinity) > minPrice) {
        piPrices[gpu] = {
          price: minPrice,
          provider: entry.provider,
        };
      }
      if (
        entry.prices.onDemand &&
        (piSecurePrices[gpu]?.price || Infinity) > entry.prices.onDemand
      ) {
        piSecurePrices[gpu] = {
          price: entry.prices.onDemand,
          provider: entry.provider,
        };
      }
    }
  }
  // const deepinfraPrices = { B200_180GB: 2.49 }
  return { piPrices, piSecurePrices };
};
