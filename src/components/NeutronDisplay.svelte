<style>
	@import '../vars';

	.graphContainer {
		background: rgba(0, 0, 0, 0.75);
	}

	svg {
		filter: drop-shadow(0 0 5px #FFF);
	}

	.viz {
		height: 400px;
	}

	.neutron-display {
		padding: 0 4px;
	}
</style>

<script>
	import { controlRods, counterHistory, maxNeutrons } from '../stores';

	const MAX_HEIGHT = 400;
	const X_INTERVAL = 20;
</script>

<div class="neutron-display">
  <div class="graphContainer">
	<svg
		class="viz"
	  viewBox="0 0 400 400"
	>
    {#each $counterHistory as historyEntry, index}
    	{#if index !== $counterHistory.length - 1}
				<line
					x1={index * X_INTERVAL}
					y1={MAX_HEIGHT - (($counterHistory[index] / $maxNeutrons) * MAX_HEIGHT)}
					x2={(index + 1) * X_INTERVAL}
					y2={MAX_HEIGHT - (($counterHistory[index + 1] / $maxNeutrons) * MAX_HEIGHT)}
					width="1px"
					stroke="white"
				/>
			{/if}
		{/each}
	</svg>
</div>
  <section class="panel panel-2">
    <p>Control Rods: {$controlRods}</p>
  </section>
</div>
