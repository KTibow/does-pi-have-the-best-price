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
      return onlyShow == "pi-competition" ? Object.keys(data).length >= 2 : true;
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
<div class="gpus">
  {#each gpusProcessed as [gpu, data]}
    {@const [gpuMain, ...gpuRAMBits] = gpu.split("_")}
    {@const gpuRAM = gpuRAMBits.join(" ")}
    {@const piPrice = data["Prime Intellect"]?.price}
    {@const enableCheapest = piPrice && Object.keys(data).find((x) => x != "Prime Intellect")}
    {@const cheapestPrice = Math.min(...Object.values(data).map((x) => x.price))}
    {@const leaderboard = Object.entries(data).sort(
      ([, { price: priceA }], [, { price: priceB }]) => priceA - priceB,
    )}
    <div
      class="gpu"
      class:green={enableCheapest && piPrice == cheapestPrice}
      class:red={enableCheapest && piPrice != cheapestPrice}
    >
      <h2 class="m3-font-headline-large">
        {gpuMain}
        <span style:opacity="0.5">{gpuRAM}</span>
      </h2>
      {#if enableCheapest}
        {#if piPrice == cheapestPrice}
          <div class="status colored m3-font-body-large">Yes.</div>
        {:else}
          <div class="status colored m3-font-body-large">No.</div>
        {/if}
      {/if}
      {#each leaderboard as [source, { price, provider }]}
        <div class="card" class:colored={source == "Prime Intellect"}>
          <h3>
            <span title="From {provider}">{source}</span>
            <div class="spacer"></div>
            ${price.toFixed(2)}
          </h3>
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .spacer {
    flex-grow: 1;
  }

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

  .gpus {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-top: 1.5rem;
  }
  .gpu {
    flex-basis: 20rem;
    flex-grow: 1;

    display: grid;
    grid-template-columns: 1fr auto;
    align-content: start;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: var(--m3-util-rounding-large);
    > * {
      padding-inline: 0.5rem;
      border-radius: var(--m3-util-rounding-small);
    }

    &.green {
      outline: solid 1px rgb(0 255 0 / 0.4);
      .colored {
        background-color: rgb(0 255 0 / 0.2);
      }
    }
    &.red {
      outline: solid 1px rgb(255 0 0 / 0.4);
      .colored {
        background-color: rgb(255 0 0 / 0.2);
      }
    }
  }

  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: -0.125rem;
    grid-column: 1;
  }
  .status {
    display: flex;
    align-items: center;
    background-color: transparent;
    grid-column: 2;
  }

  .card {
    display: grid;
    align-items: center;
    height: 2.5rem;
    grid-column: span 2;
  }
  h3 {
    display: flex;
    span {
      text-decoration: underline dotted;
    }
  }
</style>
