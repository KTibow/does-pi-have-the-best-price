import { PRIME_INTELLECT_KEY } from "$env/static/private";

const getPage = async (path: string) => {
  const resp = await fetch(`https://api.primeintellect.ai/api/v1/${path}`, {
    headers: { authorization: `Bearer ${PRIME_INTELLECT_KEY}` },
  });
  if (!resp.ok) {
    throw new Error(`Prime Intellect is ${resp.status}ing`);
  }
  return await resp.json();
};
type Prices = {
  onDemand?: number;
  communityPrice?: number;
  currency: string;
};
type Entry = {
  prices: Prices;
  provider: string;
  isSpot?: boolean;
};

export const getAvailability = async () =>
  (await getPage("availability")) as Record<string, Entry[]>;
