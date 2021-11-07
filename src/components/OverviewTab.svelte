<style>
	@import '../vars';

	.overviewTab {
		font-family: 'xanh';
		background: rgba(0, 0, 0, 0.75);
		padding: 16px;
		min-width: 300px;
		color: white;
	}

	.poison-chart {

	}
</style>

<script>
	import { currentStore } from '../stores';
	import PoisonDisplay from './PoisonDisplay.svelte';
</script>

<section class="overviewTab">
	TBD
	<div class="poison-chart">
		<PoisonDisplay />
	</div>
	<div class="resource-budget"></div>
</section>

