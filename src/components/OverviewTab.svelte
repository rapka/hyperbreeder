<style>
	@import '../vars';

	.overviewTab {
		font-family: 'xanh';
		background: rgba(0, 0, 0, 0.75);
		padding: 16px;
		min-width: 300px;
		color: white;
		display: flex;
		flex-direction: row;
	}

	.poison-chart {

	}
</style>

<script>
	import { currentStore } from '../stores';
	import PoisonDisplay from './PoisonDisplay.svelte';
	import ResourceBudgetDisplay from './ResourceBudgetDisplay.svelte';
</script>

<section class="overviewTab">
	<div class="resource-budget">
		<ResourceBudgetDisplay />
	</div>
	<div class="poison-chart">
		<PoisonDisplay />
	</div>
</section>

