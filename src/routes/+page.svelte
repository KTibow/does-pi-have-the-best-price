<script lang="ts">
  import { Switch } from "m3-svelte";
  import { tick } from "svelte";
  import Branding from "./Branding.svelte";
  let { data } = $props();
  let { excludeSpot, gpusAll, gpusSecure } = $derived(data);
  let onlyShow: "all" | "pi" | "pi-competition" = $state("pi");
  let includeCommunity = $state(true);
  let includeSpot = $derived(!excludeSpot);
  let gpus = $derived(includeCommunity ? gpusAll : gpusSecure);
  let gpusProcessed = $derived(
    Object.entries(gpus).filter(([gpu, data]) => {
      if (onlyShow == "all") return true;

      if (!("Prime Intellect" in data)) return false;
      if (onlyShow == "pi-competition" && Object.keys(data).length < 2) return false;
      return true;
    }),
  );

  let settingsForm: HTMLFormElement | undefined = $state();
</script>

<header>
  <Branding />
  <div class="spacer"></div>
  <select bind:value={onlyShow}>
    <option value="all">All</option>
    <option value="pi">Incs. PI</option>
    <option value="pi-competition">Incs. PI competition</option>
  </select>
  <label>
    {includeCommunity ? "Inc. community" : "Only secure"}
    <Switch bind:checked={includeCommunity} />
  </label>
  <form bind:this={settingsForm}>
    <input type="hidden" name="exclude-spot" value={includeSpot ? undefined : "true"} />
    <label>
      {!excludeSpot ? "Inc. spot" : "Spot excluded"}
      <Switch
        bind:checked={includeSpot}
        onchange={() => tick().then(() => settingsForm!.requestSubmit())}
      />
    </label>
  </form>
</header>
{#each gpusProcessed as [gpu, data]}
  {@const [gpuMain, ...gpuRAMBits] = gpu.split("_")}
  {@const gpuRAM = gpuRAMBits.join(" ")}
  {@const piPrice = data["Prime Intellect"]?.price}
  {@const enableCheapest = piPrice && Object.keys(data).find((x) => x != "Prime Intellect")}
  {@const cheapestPrice = Math.min(...Object.values(data).map((x) => x.price))}
  {@const leaderboard = Object.entries(data).sort(
    ([, { price: priceA }], [, { price: priceB }]) => priceA - priceB,
  )}
  <h2 class="m3-font-headline-large">
    {gpuMain}
    <span style:opacity="0.5">{gpuRAM}</span>
    <div class="spacer"></div>
    {#if enableCheapest}
      {#if piPrice == cheapestPrice}
        <div class="status m3-font-body-large green">Yes.</div>
      {:else}
        <div class="status m3-font-body-large red">No.</div>
      {/if}
    {/if}
  </h2>
  {#each leaderboard as [source, { price, provider }]}
    <div
      class="card"
      class:green={source == "Prime Intellect" && enableCheapest && price == cheapestPrice}
      class:red={source == "Prime Intellect" && enableCheapest && price != cheapestPrice}
    >
      <h3>
        <span title="From {provider}">{source}</span>
        <div class="spacer"></div>
        ${price.toFixed(2)}
      </h3>
    </div>
  {/each}
{/each}

<style>
  header {
    display: flex;
    gap: 1rem;
  }
  form {
    display: contents;
  }
  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  h2,
  .card {
    max-width: 25rem;
  }

  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 2em;

    .status {
      display: flex;
      align-items: center;
      padding: 0.5rem 1rem;
      border-radius: var(--m3-util-rounding-full);
    }
  }

  .card {
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    margin-top: 0.5em;
    border-radius: var(--m3-util-rounding-large);
    background-color: rgb(var(--m3-scheme-surface-container-low));
  }
  h3 {
    display: flex;
    span {
      text-decoration: underline dotted;
    }
  }

  /* Last but not least (for priority reasons) */
  .spacer {
    flex-grow: 1;
  }
  .green {
    background-color: rgb(0 255 0 / 0.2);
  }
  .red {
    background-color: rgb(255 0 0 / 0.2);
  }
</style>
