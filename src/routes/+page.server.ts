import { getAvailability } from "$lib/pi";
import { getAsks } from "$lib/vast";
import type { Price } from "./types";
type Prices = Record<string, Price>;

const load1 = async (excludeSpot: boolean) => {
  const piPrices: Prices = {};
  const piSecurePrices: Prices = {};
  for (const [gpu, entries] of Object.entries(await getAvailability())) {
    for (const entry of entries) {
      if (entry.prices.currency != "USD") continue;
      if (excludeSpot && entry.isSpot) continue;
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
  return { piPrices, piSecurePrices };
};
const load2 = async (excludeSpot: boolean) => {
  const [vastPrices, vastSecurePrices] = await Promise.all(
    [getAsks(excludeSpot, false), getAsks(excludeSpot, true)].map(async (asksPromise) => {
      const asks = await asksPromise;
      const prices: Prices = {};
      for (const entry of asks) {
        let name = "";
        if (entry.gpu_name == "A100 SXM4" && entry.gpu_ram == 81920) name = "A100_80GB";
        if (entry.gpu_name.startsWith("H100") && entry.gpu_ram == 81559) name = "H100_80GB";
        if (entry.gpu_name.startsWith("H200") && entry.gpu_ram == 143771) name = "H200_141GB";
        if (entry.gpu_name == "RTX 3080" && entry.gpu_ram == 10240) name = "RTX3080_10GB";
        if (entry.gpu_name == "RTX 3080 Ti" && entry.gpu_ram == 12288) name = "RTX3080Ti_12GB";
        if (entry.gpu_name == "RTX 3090" && entry.gpu_ram == 24576) name = "RTX3090_24GB";
        if (entry.gpu_name == "RTX 4080" && entry.gpu_ram == 16376) name = "RTX4080_16GB";
        if (entry.gpu_name == "RTX 4090" && entry.gpu_ram == 24564) name = "RTX4090_24GB";
        if (entry.gpu_name == "RTX 5090" && entry.gpu_ram == 32607) name = "RTX5090_32GB";
        if (!name) {
          console.warn("Support", entry.gpu_name, entry.gpu_ram);
          continue;
        }

        const price = entry.search.totalHour;
        if ((prices[name]?.price || Infinity) > price) {
          prices[name] = {
            price,
            provider: entry.geolocation.split(",")[0],
          };
        }
      }
      return prices;
    }),
  );
  return { vastPrices, vastSecurePrices };
};
// const deepinfraPrices = { B200_180GB: 2.49 }
// sf compute implementation...
// salad implementation...
export const load = async (event) => {
  const excludeSpot = event.url.searchParams.get("exclude-spot") == "true";
  const resultsArr = await Promise.all([load1(excludeSpot), load2(excludeSpot)]);
  const results = Object.assign({}, ...resultsArr);
  return results;
};
