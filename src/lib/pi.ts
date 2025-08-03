import { PRIME_INTELLECT_KEY } from "$env/static/private";

const getPage = async <T>(path: string) => {
  const resp = await fetch(`https://api.primeintellect.ai/api/v1/${path}`, {
    headers: { authorization: `Bearer ${PRIME_INTELLECT_KEY}` },
  });
  const data = await resp.json();
  return data as T;
};
type Prices = {
  onDemand?: number;
  communityPrice?: number;
  currency: string;
};
type Entry = {
  prices: Prices;
  provider: string;
};

export const getAvailability = () => getPage<Record<string, Entry[]>>("availability");
