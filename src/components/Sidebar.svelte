<style>
	#sidebar {
		margin: 32px 0 16px 16px;
	}
</style>

<script>
	import PauseButton from './PauseButton.svelte';
	import StatsPanel from './StatsPanel.svelte';
	import ResourceCounter from './ResourceCounter.svelte';
	import DateDisplay from './DateDisplay.svelte';
	import AntimatterToggle from './AntimatterToggle.svelte';
	import ActivityDisplay from './ActivityDisplay.svelte';

</script>

<div id="sidebar">
  <PauseButton />
  <StatsPanel />
  <ResourceCounter />
  <DateDisplay />
  <ActivityDisplay />
  <AntimatterToggle />
</div>
