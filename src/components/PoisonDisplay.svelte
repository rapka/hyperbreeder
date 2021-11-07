<style>
	@import '../vars';

	.graphContainer {
		flex-grow: 1;
		z-index: 10;
	}

	svg {
		filter: drop-shadow(0 0 5px #FFF);
	}

	.isError svg {
		filter: drop-shadow(0 0 5px #F00);
	}

	.neutron-display-overlay {
		z-index: 1;
		opacity: 0.4;
		mix-blend-mode: hard-light;
		background: url('noise.svg');
		position: absolute;
		height: 100%;
		width: 100%;
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
		border-top: 0;
		background: rgba(0, 0, 0, 0.75);
		position: relative;
	}
</style>

<script>
	import classNames from 'classnames';
	import { currentStore, amDimension } from '../stores';
	import NeutronDisplayYAxisLabels from './NeutronDisplayYAxisLabels.svelte';

	const MAX_HEIGHT = 300;
	const X_INTERVAL = 30;

	let counterHistory, gameStatus, isError, disabled;

	$: {
		counterHistory = $currentStore.counterHistory;
		gameStatus = $currentStore.gameStatus;
		isError = counterHistory.length && counterHistory[counterHistory.length - 1] === 0;
		disabled = gameStatus.startupTimer < 0;
	}
</script>

<div class={classNames('neutron-display', { isError, disabled })}>
	{#if disabled !== true}
		<div class="neutron-display-overlay" />
  	{/if}
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
							stroke={isError ? "red" : "white"}
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
							stroke={isError ? "red" : "white"}
						/>
					{/if}
				{/each}
			{/if}
		</svg>
	</div>
</div>