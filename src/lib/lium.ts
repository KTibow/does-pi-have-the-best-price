const getPage = async (path: string) => {
  const resp = await fetch(`https://lium.io/api/${path}`);
  if (!resp.ok) {
    throw new Error(`Lium is ${resp.status}ing`);
  }
  return await resp.json();
};

type Executor = {
  machine_name: string;
  price_per_hour: number;
  specs: {
    gpu: {
      count: number;
    };
  };
  location: {
    country: string;
  };
};
export const getExecutors = async () => (await getPage("executors")) as Executor[];
