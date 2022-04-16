<style>
	@import '../vars';

	.graphContainer {
		flex-grow: 1;
		z-index: 10;
	}

	svg {
		filter: drop-shadow(0 0 5px #FFF);
	}

	.viz {
		height: 300px;
	}

	.neutron-display {
		z-index: 10;
		display: flex;
		flex-direction: row;
		padding-bottom: 16px;
		border: 1px solid #ccc;
		background: rgba(0, 0, 0, 0.75);
		position: relative;
	}
</style>

<script>
	import { amDimension } from '../stores';
	import { resources, energyBudget  } from '../stores/matterStores';

	const MAX_HEIGHT = 400;
	const Y_OFFSET = 10;

	// const strokeDashoffset = circumference - (progress / 100) * circumference;

	// stroke={`\#${Math.min(index, 9)}${Math.min(index, 9)}FF${Math.min(index, 9)}${Math.min(index, 9)}`}
</script>

<div class="neutron-display">
	RESOURCES BUDGET
	{#if $amDimension}
		IN AM DIMENSION
	{:else}
		<div class="graphContainer">
			<svg
			  class="viz"
			  viewBox="0 0 400 400"
			>
				<rect
					stroke="white"
					fill="red"
					x="10"
					y={Y_OFFSET + MAX_HEIGHT - (($resources.energy / $energyBudget) * MAX_HEIGHT)}
					width="200"
					height={($resources.energy / $energyBudget) * MAX_HEIGHT}
				/>
				<rect
					stroke="white"
					fill="transparent"
					x="10"
					y={Y_OFFSET}
					width="200"
					height={MAX_HEIGHT}
				/>
			</svg>
		</div>
	{/if}
</div>