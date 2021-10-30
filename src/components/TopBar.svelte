<style>
	@import '../vars';

	.top-bar {
		display: flex;
		flex-direction: column;
		padding: 8px;
	}
</style>

<script>
	import ResourceCounter from './ResourceCounter.svelte';
	import DateDisplay from './DateDisplay.svelte';
</script>

<section class="top-bar">
  <ResourceCounter />
  <DateDisplay />
</section>
