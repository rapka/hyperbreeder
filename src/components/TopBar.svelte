<style>
	@import '../vars';

	.top-bar {
		display: flex;
		flex-direction: column;
		padding: 8px;
	}
</style>

<script>
	import NeutronCounter from './NeutronCounter.svelte';
	import DateDisplay from './DateDisplay.svelte';
</script>

<section class="top-bar">
  <NeutronCounter />
  <DateDisplay />
</section>
