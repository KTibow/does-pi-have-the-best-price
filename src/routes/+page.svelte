<script lang="ts">
  import { Switch } from "m3-svelte";
  import Branding from "./Branding.svelte";
  let { data } = $props();
  let { excludeSpot, gpusAll, gpusSecure } = $derived(data);
  let useSecurePrices = $state(false);
  let gpus = $derived(useSecurePrices ? gpusSecure : gpusAll);

  let settingsForm: HTMLFormElement | undefined = $state();
</script>

<header>
  <Branding />
  <div class="spacer"></div>
  <label>
    {useSecurePrices ? "Only secure" : "Inc. community"}
    <Switch bind:checked={useSecurePrices} />
  </label>
  <form bind:this={settingsForm}>
    <label>
      {excludeSpot ? "Spot excluded" : "Inc. spot"}
      <Switch
        name="exclude-spot"
        checked={excludeSpot}
        oninput={() => {
          settingsForm!.requestSubmit();
        }}
      />
    </label>
  </form>
</header>
<pre>{JSON.stringify(gpus, null, 2)}</pre>

<style>
  header {
    display: flex;
    gap: 1rem;
  }
  .spacer {
    flex-grow: 1;
  }
  form {
    display: contents;
  }
  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
