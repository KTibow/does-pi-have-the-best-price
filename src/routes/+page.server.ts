import { getAvailability } from "$lib/pi";

export const load = async () => {
  const piPrices: Record<string, { price: number; provider: string }> = {};
  for (const [gpu, entries] of Object.entries(await getAvailability())) {
    for (const entry of entries) {
      if (entry.prices.currency != "USD") continue;
      const price = Math.min(
        entry.prices.communityPrice || Infinity,
        entry.prices.onDemand || Infinity,
      );
      if (price == Infinity) continue;
      if (piPrices[gpu] && piPrices[gpu].price < price) continue;
      piPrices[gpu] = { price, provider: entry.provider };
    }
  }
  // const deepinfraPrices = { B200_180GB: 2.49 }
  return { piPrices };
};
