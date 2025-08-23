<script lang="ts">
  import iconRAM from "@ktibow/iconset-material-symbols/memory-alt-rounded";
  import { Button, Checkbox, ConnectedButtons, Divider, ListItem, Slider, Switch } from "m3-svelte";
  import { tick } from "svelte";
  import { professional, consumer } from "./arches";
  import Branding from "./Branding.svelte";
  import ArchControl from "./ArchControl.svelte";

  const getRAM = (gpu: string) => {
    const ramMatch = gpu.match(/_([0-9]+)GB/);
    const countMatch = gpu.match(/_x([0-9]+)/);

    if (!ramMatch) return undefined;

    let ram = +ramMatch[1];
    if (countMatch) {
      ram *= +countMatch[1];
    }

    return ram;
  };
  let { data } = $props();
  let { excludeSpot, gpusAll, gpusSecure } = $derived(data);
  let onlyShow: "all" | "pi" | "pi-competition" = $state("pi");
  let includeCommunity = $state(true);
  let includeSpot = $derived(!excludeSpot);
  let minRAMRaw = $state(0);
  let minRAM = $derived(Math.round(10 ** minRAMRaw));
  let professionalControl = $state(
    Object.fromEntries(Object.keys(professional).map((a) => [a, true])),
  );
  let consumerControl = $state(Object.fromEntries(Object.keys(consumer).map((a) => [a, true])));
  let otherControl = $state(true);
  let gpus = $derived(includeCommunity ? gpusAll : gpusSecure);
  let maxRAM = $derived(
    Math.max(
      ...Object.entries(gpus)
        .filter(([k, v]) => Object.keys(v).length >= 2)
        .map(([k]) => getRAM(k) || 0),
    ),
  );
  let gpusProcessed = $derived(
    Object.entries(gpus)
      .filter(([gpu, data]) => {
        if (onlyShow == "all") return true;

        if (!("Prime Intellect" in data)) return false;
        return onlyShow == "pi-competition" ? Object.keys(data).length >= 2 : true;
      })
      .filter(([gpu]) => {
        if (minRAM <= 1) return true;

        return (getRAM(gpu) || 0) >= minRAM;
      })
      .filter(([gpu]) => {
        const gpuId = gpu.split("_")[0];
        for (const arch in professional) {
          for (const g of professional[arch]) {
            if (gpuId == g) {
              return professionalControl[arch];
            }
          }
        }
        for (const arch in consumer) {
          for (const g of consumer[arch]) {
            if (gpuId == g) {
              return consumerControl[arch];
            }
          }
        }
        return otherControl;
      }),
  );

  let settingsForm: HTMLFormElement | undefined = $state();
</script>

<header>
  <Branding />
  <div class="spacer"></div>
  <Button variant="tonal" popovertarget="settings">Settings</Button>
</header>
<div id="settings" class="settings" popover>
  <form bind:this={settingsForm}>
    <input type="hidden" name="exclude-spot" value={includeSpot ? undefined : "true"} />
  </form>
  <ConnectedButtons>
    <input
      type="radio"
      value={true}
      bind:group={includeSpot}
      id="settings-spot-included"
      oninput={() => tick().then(() => settingsForm!.requestSubmit())}
    />
    <Button for="settings-spot-included">Include spot</Button>
    <input type="radio" value={false} bind:group={includeSpot} id="settings-spot-excluded" />
    <Button for="settings-spot-excluded">Exclude spot</Button>
  </ConnectedButtons>
  <ConnectedButtons>
    <input type="radio" value={true} bind:group={includeCommunity} id="includeCommunity-true" />
    <Button for="includeCommunity-true">Include community</Button>
    <input type="radio" value={false} bind:group={includeCommunity} id="includeCommunity-false" />
    <Button for="includeCommunity-false">Only secure</Button>
  </ConnectedButtons>
  <ConnectedButtons>
    <input type="radio" value="all" bind:group={onlyShow} id="onlyShow-all" />
    <Button for="onlyShow-all">All</Button>
    <input type="radio" value="pi" bind:group={onlyShow} id="onlyShow-pi" />
    <Button for="onlyShow-pi">W/ Prime Intellect</Button>
    <input type="radio" value="pi-competition" bind:group={onlyShow} id="onlyShow-pi-competition" />
    <Button for="onlyShow-pi-competition">PI + competition</Button>
  </ConnectedButtons>
  <Slider
    min={0}
    max={Math.log10(maxRAM)}
    format={(n) => (10 ** n).toFixed(0)}
    size="m"
    leadingIcon={iconRAM}
    bind:value={minRAMRaw}
  />
  <div class="arches">
    <ArchControl {professionalControl} {consumerControl} bind:otherControl />
  </div>
</div>
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
    display: none;
  }

  .settings {
    &:popover-open {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    background-color: rgb(var(--m3-scheme-surface-container-highest));
    padding: 1rem;
    border-end-start-radius: var(--m3-util-rounding-large);

    inset: auto;
    top: 0;
    right: 0;

    .arches {
      display: flex;
      flex-direction: column;
      --m3-util-density-term: -1rem;
      > :global(label) {
        margin-inline: -1rem;
      }
    }
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
