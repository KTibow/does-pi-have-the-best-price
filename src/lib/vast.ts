const getPage = async (path: string, init: RequestInit) => {
  const resp = await fetch(`https://console.vast.ai/api/v0/${path}`, init);
  if (!resp.ok) {
    throw new Error(`Vast is ${resp.status}ing`);
  }
  return await resp.json();
};

export const getAsks = async (excludeSpot: boolean, requireDatacenter: boolean) => {
  const { offers } = await getPage("search/asks", {
    method: "PUT",
    body: JSON.stringify({
      q: {
        rentable: { eq: true },
        rented: { eq: false },
        verified: { eq: true },
        type: excludeSpot ? "on-demand" : undefined,
        datacenter: requireDatacenter ? { eq: true } : undefined,
        limit: 200,
      },
    }),
  });
  return offers as {
    gpu_name: string;
    gpu_ram: number;
    search: { totalHour: number };
    geolocation: string;
  }[];
};
