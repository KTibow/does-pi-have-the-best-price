import { getAvailability } from "$lib/pi";
import { getAsks } from "$lib/vast";
import type { Price } from "./types";
type Prices = Record<string, Price>;

const load1 = async (excludeSpot: boolean) => {
  const PI: Prices = {};
  const PISecure: Prices = {};
  for (const [gpu, entries] of Object.entries(await getAvailability())) {
    for (const entry of entries) {
      if (entry.prices.currency != "USD") continue;
      if (excludeSpot && entry.isSpot) continue;
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
        if (entry.gpu_name == "A10" && Math.abs(24000 - entry.gpu_ram) < 1000) name = "A10_24GB";
        if (entry.gpu_name == "A40" && entry.gpu_ram == 46068) name = "A40_48GB";
        if (entry.gpu_name == "L40" && entry.gpu_ram == 46068) name = "L40_48GB";
        if (entry.gpu_name == "L40S" && entry.gpu_ram == 46068) name = "L40S_48GB";
        if (entry.gpu_name == "RTX 3080 Ti" && entry.gpu_ram == 12288) name = "RTX3080Ti_12GB";
        if (entry.gpu_name == "RTX 3080" && entry.gpu_ram == 10240) name = "RTX3080_10GB";
        if (entry.gpu_name == "RTX 3090 Ti" && entry.gpu_ram == 24564) name = "RTX3090Ti_24GB";
        if (entry.gpu_name == "RTX 3090" && entry.gpu_ram == 24576) name = "RTX3090_24GB";
        if (entry.gpu_name == "RTX 4070 Ti" && entry.gpu_ram == 12282) name = "RTX4070Ti_12GB";
        if (entry.gpu_name == "RTX 4080" && entry.gpu_ram == 16376) name = "RTX4080_16GB";
        if (entry.gpu_name == "RTX 4090" && entry.gpu_ram == 24564) name = "RTX4090_24GB";
        if (entry.gpu_name == "RTX 5090" && entry.gpu_ram == 32607) name = "RTX5090_32GB";
        if (entry.gpu_name == "RTX 6000Ada" && entry.gpu_ram == 49140) name = "RTX6000Ada_48GB";
        if (entry.gpu_name == "RTX A4000" && entry.gpu_ram == 16376) name = "A4000_16GB";
        if (entry.gpu_name == "RTX A5000" && entry.gpu_ram == 24564) name = "A5000_24GB";
        if (entry.gpu_name == "RTX A6000" && entry.gpu_ram == 49140) name = "A6000_48GB";
        if (entry.gpu_name == "Tesla V100" && entry.gpu_ram == 16384) name = "V100_16GB";
        if (entry.gpu_name == "Tesla V100" && entry.gpu_ram == 32768) name = "V100_32GB";
        if (entry.gpu_name.startsWith("A100") && entry.gpu_ram == 40960) name = "A100_40GB";
        if (entry.gpu_name.startsWith("A100") && entry.gpu_ram == 81920) name = "A100_80GB";
        if (entry.gpu_name.startsWith("H100") && entry.gpu_ram == 81559) name = "H100_80GB";
        if (entry.gpu_name.startsWith("H200") && entry.gpu_ram == 143771) name = "H200_141GB";
        if (!name) {
          continue;
        }
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
// const deepinfraPrices = { B200_180GB: 2.49 }
// sf compute implementation...
// salad implementation...
export const load = async (event) => {
  const excludeSpot = event.url.searchParams.get("exclude-spot") == "true";
  const gpus: Record<string, Record<string, Price>> = {};
  const gpusSecure: Record<string, Record<string, Price>> = {};
  for (const [source, prices] of Object.entries(
    Object.assign({}, ...(await Promise.all([load1(excludeSpot), load2(excludeSpot)]))),
  )) {
    for (const [gpu, price] of Object.entries(prices).sort(([gpuA], [gpuB]) =>
      gpuA.localeCompare(gpuB),
    )) {
      if (source.endsWith("Secure")) {
        const gpuData = (gpusSecure[gpu] ||= {});
        gpuData[source.replace("Secure", "").trim()] = price;
      } else {
        const gpuData = (gpus[gpu] ||= {});
        gpuData[source] = price;
      }
    }
  }
  return { excludeSpot, gpusAll: gpus, gpusSecure };
};
