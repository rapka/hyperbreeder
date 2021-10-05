<style>
	@import '../vars';

	.graphContainer {
		background: rgba(0, 0, 0, 0.75);
		flex-grow: 1;
	}

	svg {
		filter: drop-shadow(0 0 5px #FFF);
	}

	.viz {
		height: 400px;
	}

	.neutron-display {
		display: flex;
		flex-direction: row;
	}
</style>

<script>
	import { controlRods, counterHistory, gameStatus } from '../stores';
	import NeutronDisplayYAxisLabels from './NeutronDisplayYAxisLabels.svelte';

	const MAX_HEIGHT = 400;
	const X_INTERVAL = 30;
</script>

<div class="neutron-display">
	<NeutronDisplayYAxisLabels />
  <div class="graphContainer">
	<svg
		class="viz"
	  viewBox="0 0 400 400"
	>
    {#each $counterHistory as historyEntry, index}
    	{#if index !== $counterHistory.length - 1}
				<line
					x1={index * X_INTERVAL}
					y1={MAX_HEIGHT - (($counterHistory[index] / $gameStatus.maxNeutrons) * MAX_HEIGHT)}
					x2={(index + 1) * X_INTERVAL}
					y2={MAX_HEIGHT - (($counterHistory[index + 1] / $gameStatus.maxNeutrons) * MAX_HEIGHT)}
					width="1px"
					stroke={counterHistory.length && counterHistory[counterHistory.length - 1] === 0 ? "red" : "white"}
				/>
			{/if}
		{/each}
	</svg>
</div>
</div>
<section class="panel panel-2">
    <p>Control Rods: {$controlRods}</p>
  </section>