<script lang="ts">
  import { ListItem, Checkbox, Divider } from "m3-svelte";
  import { professional, consumer } from "./arches";

  let {
    professionalControl,
    consumerControl,
    otherControl = $bindable(),
  }: {
    professionalControl: Record<string, boolean>;
    consumerControl: Record<string, boolean>;
    otherControl: boolean;
  } = $props();
</script>

{#snippet control(group: string, data: Record<string, string[]>, toggle: Record<string, boolean>)}
  <ListItem headline={group} label>
    {#snippet leading()}
      <div class="box-wrapper">
        <Checkbox
          ><input
            type="checkbox"
            bind:checked={
              () => Object.keys(data).some((arch) => toggle[arch]),
              (enable) => {
                if (enable) {
                  for (const arch of Object.keys(data)) {
                    toggle[arch] = true;
                  }
                } else {
                  for (const arch of Object.keys(data)) {
                    toggle[arch] = false;
                  }
                }
              }
            }
          /></Checkbox
        >
      </div>
    {/snippet}
  </ListItem>
  {#each Object.keys(data) as a}
    <ListItem headline={a} label>
      {#snippet leading()}
        <div class="box-wrapper">
          <Checkbox><input type="checkbox" bind:checked={toggle[a]} /></Checkbox>
        </div>
      {/snippet}
    </ListItem>
  {/each}
  <Divider />
{/snippet}

{@render control("Professional", professional, professionalControl)}
{@render control("Consumer", consumer, consumerControl)}

<ListItem headline="Other" label>
  {#snippet leading()}
    <div class="box-wrapper">
      <Checkbox><input type="checkbox" bind:checked={otherControl} /></Checkbox>
    </div>
  {/snippet}
</ListItem>

<style>
  .box-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
  }
</style>
