<style>
	@import '../vars';

	.graphContainer {
		flex-grow: 1;
	}

	svg {
		filter: drop-shadow(0 0 5px #FFF);
	}

	.viz {
		height: 300px;
	}

	.neutron-display {
		display: flex;
		flex-direction: row;
		padding-bottom: 16px;
		border: 1px solid #ccc;
		border-top: 0;
		background: rgba(0, 0, 0, 0.75);
	}
</style>

<script>
	import { currentStore, amDimension } from '../stores';
	import NeutronDisplayYAxisLabels from './NeutronDisplayYAxisLabels.svelte';
	import ControlRodList from './ControlRodList.svelte';

	const MAX_HEIGHT = 300;
	const X_INTERVAL = 30;

	let counterHistory, gameStatus;

	$: {
		counterHistory = $currentStore.counterHistory;
		gameStatus = $currentStore.gameStatus;
	}
</script>

<div class="neutron-display">
	<NeutronDisplayYAxisLabels />
  <div class="graphContainer">
	<svg
		class="viz"
	  viewBox="0 0 800 300"
	>
		{#if $amDimension}
			{#each counterHistory as historyEntry, index}
				{#if index !== counterHistory.length - 1}
					<line
						x1={index * X_INTERVAL}
						y1={MAX_HEIGHT - ((counterHistory[index] / gameStatus.maxNeutrons) * MAX_HEIGHT)}
						x2={(index + 1) * X_INTERVAL}
						y2={MAX_HEIGHT - ((counterHistory[index + 1] / gameStatus.maxNeutrons) * MAX_HEIGHT)}
						width="1px"
						stroke={counterHistory.length && counterHistory[counterHistory.length - 1] === 0 ? "red" : "white"}
					/>
				{/if}
			{/each}
		{:else}
			{#each counterHistory as historyEntry, index}
				{#if index !== counterHistory.length - 1}
					<line
						x1={index * X_INTERVAL}
						y1={MAX_HEIGHT - ((counterHistory[index] / gameStatus.maxNeutrons) * MAX_HEIGHT)}
						x2={(index + 1) * X_INTERVAL}
						y2={MAX_HEIGHT - ((counterHistory[index + 1] / gameStatus.maxNeutrons) * MAX_HEIGHT)}
						width="1px"
						stroke={counterHistory.length && counterHistory[counterHistory.length - 1] === 0 ? "red" : "white"}
					/>
				{/if}
			{/each}
		{/if}
	</svg>
</div>
</div>
<section class="panel panel-2">
    <ControlRodList />
  </section>