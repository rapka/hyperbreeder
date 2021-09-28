<style>
	#left-column {
		flex: 0 0;
		padding: 20px;
	}
</style>

<script>
	import PauseButton from './PauseButton.svelte';
	import StatsPanel from './StatsPanel.svelte';
	import Refuel from './Refuel.svelte';
</script>

<div id="left-column">
  <PauseButton />
  <Refuel />
  <StatsPanel />
</div>
