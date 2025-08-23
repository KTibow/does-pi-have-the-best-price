import { getExecutors } from "$lib/lium";
import { getAvailability, getClusterAvailability, type Entry } from "$lib/pi";
import { getAsks } from "$lib/vast";
import type { Price } from "./types";
type Prices = Record<string, Price>;

const load1 = async (excludeSpot: boolean) => {
  const PI: Prices = {};
  const PISecure: Prices = {};
  const processEntry = (gpu: string, entry: Entry) => {
    if (entry.prices.currency != "USD") return;
    if (excludeSpot && entry.isSpot) return;
    const minPrice = Math.min(
      entry.prices.communityPrice || Infinity,
      entry.prices.onDemand || Infinity,
    );
    if (minPrice && (PI[gpu]?.price || Infinity) > minPrice) {
      PI[gpu] = {
        price: minPrice,
        provider: entry.provider,
      };
    }
    if (entry.prices.onDemand && (PISecure[gpu]?.price || Infinity) > entry.prices.onDemand) {
      PISecure[gpu] = {
        price: entry.prices.onDemand,
        provider: entry.provider,
      };
    }
  };
  for (const [gpu, entries] of Object.entries(await getAvailability())) {
    for (const entry of entries) {
      processEntry(gpu, entry);
    }
  }
  for (const [gpu, entries] of Object.entries(await getClusterAvailability())) {
    for (const entry of entries) {
      processEntry(`${gpu}_x${entry.gpuCount}`, entry);
    }
  }
  return { "Prime Intellect": PI, "Prime Intellect Secure": PISecure };
};
const load2 = async (excludeSpot: boolean) => {
  const getLocationName = (location: string) => {
    // prettier-ignore
    const countries = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Côte d’Ivoire", "Croatia", "Cuba", "Cyprus", "Czechia", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];
    const firstPart = location.split(",")[0];
    if (countries.includes(firstPart)) return firstPart;
    return location;
  };
  const [Vast, VastSecure] = await Promise.all(
    [getAsks(excludeSpot, false), getAsks(excludeSpot, true)].map(async (asksPromise) => {
      const asks = await asksPromise;
      const prices: Prices = {};
      let nTotal = 0;
      let nFound = 0;
      for (const entry of asks) {
        nTotal++;
        let name = "";
        const cr = (gib: number) => entry.gpu_ram >= gib * 1024 * 0.9;
        if (entry.gpu_name == "A10" && cr(24)) name = "A10_24GB";
        if (entry.gpu_name == "A40" && cr(48)) name = "A40_48GB";
        if (entry.gpu_name == "L4" && cr(24)) name = "L40_24GB";
        if (entry.gpu_name == "L40" && cr(48)) name = "L40_48GB";
        if (entry.gpu_name == "L40S" && cr(48)) name = "L40S_48GB";
        if (entry.gpu_name == "RTX 2080 Ti" && cr(11)) name = "RTX2080Ti_11GB";
        if (entry.gpu_name == "RTX 3060 Ti" && cr(8)) name = "RTX3060Ti_8GB";
        if (entry.gpu_name == "RTX 3060" && cr(12)) name = "RTX3060_12GB";
        if (entry.gpu_name == "RTX 3070 Ti" && cr(8)) name = "RTX3070Ti_8GB";
        if (entry.gpu_name == "RTX 3070" && cr(8)) name = "RTX3070_8GB";
        if (entry.gpu_name == "RTX 3080 Ti" && cr(12)) name = "RTX3080Ti_12GB";
        if (entry.gpu_name == "RTX 3080" && cr(10)) name = "RTX3080_10GB";
        if (entry.gpu_name == "RTX 3090 Ti" && cr(24)) name = "RTX3090Ti_24GB";
        if (entry.gpu_name == "RTX 3090" && cr(24)) name = "RTX3090_24GB";
        if (entry.gpu_name == "RTX 4060" && cr(8)) name = "RTX4060_8GB";
        if (entry.gpu_name == "RTX 4060 Ti" && cr(16)) name = "RTX4060Ti_16GB";
        if (entry.gpu_name == "RTX 4070 Ti" && cr(12)) name = "RTX4070Ti_12GB";
        if (entry.gpu_name == "RTX 4070" && cr(12)) name = "RTX4070_12GB";
        if (entry.gpu_name == "RTX 4070S Ti" && cr(16)) name = "RTX4070STi_16GB";
        if (entry.gpu_name == "RTX 4070S" && cr(12)) name = "RTX4070S_12GB";
        if (entry.gpu_name == "RTX 4080" && cr(16)) name = "RTX4080_16GB";
        if (entry.gpu_name == "RTX 4080S" && cr(16)) name = "RTX4080S_16GB";
        if (entry.gpu_name == "RTX 4090" && cr(24)) name = "RTX4090_24GB";
        if (entry.gpu_name == "RTX 5000Ada" && cr(32)) name = "RTX5000Ada_32GB";
        if (entry.gpu_name == "RTX 5060" && cr(8)) name = "RTX5060_8GB";
        if (entry.gpu_name == "RTX 5060 Ti" && cr(8)) name = "RTX5060Ti_8GB";
        if (entry.gpu_name == "RTX 5060 Ti" && cr(16)) name = "RTX5060Ti_16GB";
        if (entry.gpu_name == "RTX 5070 Ti" && cr(16)) name = "RTX5070Ti_16GB";
        if (entry.gpu_name == "RTX 5070" && cr(12)) name = "RTX5070_12GB";
        if (entry.gpu_name == "RTX 5080" && cr(16)) name = "RTX5080_16GB";
        if (entry.gpu_name == "RTX 5090" && cr(32)) name = "RTX5090_32GB";
        if (entry.gpu_name == "RTX 6000Ada" && cr(48)) name = "RTX6000Ada_48GB";
        if (entry.gpu_name == "RTX A4000" && cr(16)) name = "A4000_16GB";
        if (entry.gpu_name == "RTX A4500" && cr(20)) name = "A4500_20GB";
        if (entry.gpu_name == "RTX A5000" && cr(24)) name = "A5000_24GB";
        if (entry.gpu_name == "RTX A6000" && cr(48)) name = "A6000_48GB";
        if (entry.gpu_name == "Tesla V100" && cr(16)) name = "V100_16GB";
        if (entry.gpu_name == "Tesla V100" && cr(32)) name = "V100_32GB";
        if (entry.gpu_name == "Tesla P100" && cr(12)) name = "P100_12GB";
        if (entry.gpu_name == "Tesla P100" && cr(16)) name = "P100_16GB";
        if (entry.gpu_name == "Tesla P40" && cr(24)) name = "P40_24GB";
        if (entry.gpu_name.startsWith("RTX PRO 4000") && cr(24)) name = "RTXPro4000_24GB";
        if (entry.gpu_name.startsWith("RTX PRO 4500") && cr(48)) name = "RTXPro4500_32GB";
        if (entry.gpu_name.startsWith("RTX PRO 5000") && cr(48)) name = "RTXPro5000_48GB";
        if (entry.gpu_name.startsWith("RTX PRO 6000") && cr(96)) name = "RTXPro6000_96GB";
        if (entry.gpu_name.startsWith("A100") && cr(40)) name = "A100_40GB";
        if (entry.gpu_name.startsWith("A100") && cr(80)) name = "A100_80GB";
        if (entry.gpu_name.startsWith("H100") && cr(80)) name = "H100_80GB";
        if (entry.gpu_name.startsWith("H200") && cr(141)) name = "H200_141GB";
        if (entry.gpu_name.startsWith("B200") && cr(180)) name = "B200_180GB";
        if (!name) {
          console.log(entry.gpu_name);
          continue;
        }
        if (entry.num_gpus > 1) name += `_x${entry.num_gpus}`;
        nFound++;

        const price = entry.search.totalHour;
        if ((prices[name]?.price || Infinity) > price) {
          prices[name] = {
            price,
            provider: getLocationName(entry.geolocation),
          };
        }
      }
      console.log(`${nFound}/${nTotal}`, "found");
      return prices;
    }),
  );
  return { Vast, VastSecure };
};
const load3 = async () => {
  const getPrice = (price: number) => ({ price, provider: "VC money" });
  const prices = {
    B200_180GB: getPrice(2.49),
    B200_180GB_x2: getPrice(2.49 * 2),
    B200_180GB_x4: getPrice(2.49 * 4),
    B200_180GB_x8: getPrice(2.49 * 8),
  };
  return {
    DeepInfra: prices,
    DeepInfraSecure: prices,
  };
};
const load4 = async (excludeSpot: boolean) => {
  const cpuMemCost = 0.004 * 4 + 0.001 * 8;
  const price = (batch: number, normal: number) => ({
    price: cpuMemCost + (excludeSpot ? normal : batch),
    provider: "9 year old gamers",
  });

  const SaladSecure: Prices = {
    // SaladCloud Secure Cards (8x Clusters)
    A100_40GB_x8: price(0.4 * 8, 0.95 * 8),
    A100_80GB_x8: price(0.5 * 8, 1.0 * 8),
    L40S_48GB_x8: price(0.32 * 8, 0.81 * 8),
  };
  const Salad: Prices = {
    ...SaladSecure,

    // RTX 5000 Series
    RTX5090_32GB: price(0.27, 0.45),
    RTX5080_16GB: price(0.195, 0.42),

    // RTX 4000 Series
    RTX4090_24GB: price(0.18, 0.3),
    RTX4080_16GB: price(0.13, 0.28),
    RTX4070STi_16GB: price(0.13, 0.26),
    RTX4070Ti_12GB: price(0.1, 0.24),
    RTX4070_12GB: price(0.1, 0.22),
    RTX4060Ti_16GB: price(0.1, 0.22),

    // RTX 3000 Series
    RTX3090Ti_24GB: price(0.13, 0.28),
    RTX3090_24GB: price(0.1, 0.25),
    RTX3080Ti_12GB: price(0.1, 0.22),
    RTX3080_10GB: price(0.09, 0.18),
    RTX3070Ti_8GB: price(0.07, 0.1),
    RTX3070_8GB: price(0.07, 0.1),
    RTX3060_12GB: price(0.06, 0.08),
    RTX3050_8GB: price(0.04, 0.07),

    // RTX 2000 Series
    RTX2080Ti_11GB: price(0.08, 0.1),
    RTX2080_8GB: price(0.06, 0.08),
    RTX2070_8GB: price(0.03, 0.06),
    RTX2060_6GB: price(0.03, 0.05),

    // GTX 1000 Series
    GTX1660S_6GB: price(0.03, 0.04),
    GTX1660_6GB: price(0.03, 0.04),
    GTX1650_4GB: price(0.02, 0.02),
    GTX1080Ti_8GB: price(0.03, 0.04),
    GTX1080_8GB: price(0.03, 0.04),
    GTX1070_8GB: price(0.03, 0.04),
    GTX1060_6GB: price(0.02, 0.03),
    GTX1050Ti_4GB: price(0.02, 0.02),
  };
  return { Salad, SaladSecure };
};
const load5 = async (excludeSpot: boolean) => {
  // TODO: once I get on to SF Compute, make this use the real api
  // instead of these estimates
  const getPrice = (price: number) => ({ price, provider: "more VC money" });
  const prices = excludeSpot
    ? {
        H100_80GB_x8: getPrice(1.4 * 8),
        H100_80GB_x16: getPrice(1.4 * 16),
        H100_80GB_x32: getPrice(1.4 * 32),
        H100_80GB_x64: getPrice(1.4 * 64),
        H100_80GB_x128: getPrice(1.44 * 128),
        H100_80GB_x256: getPrice(1.77 * 256),
        H200_141GB_x8: getPrice(2.05 * 8),
        H200_141GB_x16: getPrice(2.05 * 16),
        H200_141GB_x32: getPrice(2.74 * 32),
      }
    : {
        H100_80GB_x8: getPrice(1.39 * 8),
        H100_80GB_x16: getPrice(1.39 * 16),
        H100_80GB_x32: getPrice(1.39 * 32),
        H100_80GB_x64: getPrice(1.39 * 64),
        H100_80GB_x128: getPrice(1.44 * 128),
        H100_80GB_x256: getPrice(1.55 * 256),
        H200_141GB_x8: getPrice(1.31 * 8),
        H200_141GB_x16: getPrice(1.34 * 16),
        H200_141GB_x32: getPrice(1.34 * 32),
      };
  return { "SF Compute": prices, "SF Compute Secure": prices };
};
const load6 = async () => {
  const Lium: Prices = {};
  for (const executor of await getExecutors()) {
    let name = "";
    if (executor.machine_name == "NVIDIA A100-SXM4-80GB") name = "A100_80GB";
    if (executor.machine_name == "NVIDIA GeForce RTX 3090") name = "RTX3090_24GB";
    if (executor.machine_name == "NVIDIA GeForce RTX 4090") name = "RTX4090_24GB";
    if (executor.machine_name == "NVIDIA H100 80GB HBM3") name = "H100_80GB";
    if (executor.machine_name == "NVIDIA H100 PCIe") name = "H100_80GB";
    if (executor.machine_name == "NVIDIA H200") name = "H200_141GB";
    if (executor.machine_name == "NVIDIA L4") name = "L4_24GB";
    if (executor.machine_name == "NVIDIA RTX A4000") name = "A4000_16GB";
    if (executor.machine_name == "NVIDIA RTX A6000") name = "A6000_48GB";
    if (!name) {
      console.log(executor.machine_name);
      continue;
    }
    if (executor.specs.gpu.count > 1) name += `_x${executor.specs.gpu.count}`;

    const price = executor.price_per_hour;
    if ((Lium[name]?.price || Infinity) > price) {
      Lium[name] = {
        price,
        provider: executor.location.country,
      };
    }
  }
  return { Lium };
};
export const load = async (event) => {
  const excludeSpot = event.url.searchParams.get("exclude-spot") == "true";
  let gpus: Record<string, Record<string, Price>> = {};
  let gpusSecure: Record<string, Record<string, Price>> = {};
  for (const [source, prices] of Object.entries(
    Object.assign(
      {},
      ...(await Promise.all([
        load1(excludeSpot),
        load2(excludeSpot),
        load3(),
        load4(excludeSpot),
        load5(excludeSpot),
        load6(),
      ])),
    ) as Record<string, Prices>,
  )) {
    for (const [gpu, price] of Object.entries(prices)) {
      if (source.endsWith("Secure")) {
        const gpuData = (gpusSecure[gpu] ||= {});
        gpuData[source.replace("Secure", "").trim()] = price;
      } else {
        const gpuData = (gpus[gpu] ||= {});
        gpuData[source] = price;
      }
    }
  }
  const sortByPrice = (obj: Record<string, Record<string, Price>>) => {
    const sorted: Record<string, Record<string, Price>> = {};
    Object.entries(obj)
      .sort(([, sourcesA], [, sourcesB]) => {
        const minA = Math.min(...Object.values(sourcesA).map((p) => p.price));
        const minB = Math.min(...Object.values(sourcesB).map((p) => p.price));
        return minA - minB;
      })
      .forEach(([gpu, sources]) => {
        sorted[gpu] = sources;
      });
    return sorted;
  };
  gpus = sortByPrice(gpus);
  gpusSecure = sortByPrice(gpusSecure);
  return { excludeSpot, gpusAll: gpus, gpusSecure };
};
