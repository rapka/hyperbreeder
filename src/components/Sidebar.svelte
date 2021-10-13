<style>
	#sidebar {
		padding: 20px 0;
	}
</style>

<script>
	import PauseButton from './PauseButton.svelte';
	import StatsPanel from './StatsPanel.svelte';
	import NeutronCounter from './NeutronCounter.svelte';
	import DateDisplay from './DateDisplay.svelte';
</script>

<div id="sidebar">
  <PauseButton />
  <StatsPanel />
  <NeutronCounter />
  <DateDisplay />
</div>
