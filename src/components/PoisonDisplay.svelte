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
	import classNames from 'classnames';
	import { currentStore } from '../stores';
	import NeutronDisplayYAxisLabels from './NeutronDisplayYAxisLabels.svelte';

	const MAX_HEIGHT = 300;
	const X_INTERVAL = 30;

	let counterHistory, gameStatus, disabled;

	const radius = 90;
	const stroke = 20;
	const normalizedRadius = radius - stroke * 2;
	const circumference = normalizedRadius * 2 * Math.PI;

	const radius2 = 64;
	const stroke2 = 15;
	const normalizedRadius2 = radius2 - stroke2 * 2;
	const circumference2 = normalizedRadius2 * 2 * Math.PI;

	const radius3 = 38;
	const stroke3 = 10;
	const normalizedRadius3 = radius3 - stroke3 * 2;
	const circumference3 = normalizedRadius3 * 2 * Math.PI;
	let poisonValues;
	let powerLevel, startupAmount;

	// const strokeDashoffset = circumference - (progress / 100) * circumference;

	$: {
		powerLevel = $currentStore.resources.powerLevel;
		counterHistory = $currentStore.counterHistory;
		gameStatus = $currentStore.gameStatus;
		startupAmount = $currentStore.gameStatus.startupAmount;

		const hasPower = $currentStore.resources.powerLevel > 0;
		let sum = 0;
		let sum2 = 0;
		let sum3 = 0;

		const getProgress = (progressValue) => hasPower ? (progressValue / powerLevel) : (progressValue / startupAmount);

		poisonValues = $currentStore.resources.xenon.map((value, index) => {
			let progress = getProgress(value);
			let progress2 = getProgress(value * 10);
			let progress3 = getProgress(value * 100);
			sum += progress;
			sum2 += progress2;
			sum3 += progress3;

			return {
				value1: progress * circumference,
				value2: progress2 * circumference2,
				value3: progress3 * circumference3,
				offset1: -1 * (sum - progress) * circumference,
				offset2: -1 * (sum2 - progress2) * circumference2,
				offset3: -1 * (sum3 - progress3) * circumference3,

			};
		});
	}
	// stroke={`\#${Math.min(index, 9)}${Math.min(index, 9)}FF${Math.min(index, 9)}${Math.min(index, 9)}`}
</script>

<div class="neutron-display">
  	<div class="graphContainer">
		<svg
		  class="viz"
		  viewBox="0 0 300 300"
		>
				{#each poisonValues as poisonEntry, index}
						<circle
							stroke={`\#FF${Math.min(index, 9)}${Math.min(index, 9)}${Math.min(index, 9)}${Math.min(index, 9)}`}
							fill="transparent"
							stroke-width={stroke}
							stroke-dasharray={`${poisonEntry.value1} ${circumference}`}
							stroke-dashoffset={poisonEntry.offset1}
							r={normalizedRadius}
							cx={radius}
							cy={radius}
						/>
						<circle
							stroke={index % 2 === 0 ? 'red' : 'white'}
							fill="transparent"
							stroke-width={stroke2}
							stroke-dasharray={`${poisonEntry.value2} ${circumference2}`}
							stroke-dashoffset={poisonEntry.offset2}
							r={normalizedRadius2}
							cx={radius2 + 16}
							cy={radius2 + 24}
						/>
						<circle
							stroke={`\#${Math.min(index, 9)}${Math.min(index, 9)}${Math.min(index, 9)}${Math.min(index, 9)}FF`}
							fill="transparent"
							stroke-width={stroke3}
							stroke-dasharray={`${poisonEntry.value3} ${circumference3}`}
							stroke-dashoffset={poisonEntry.offset3}
							r={normalizedRadius3}
							cx={radius3 + 36}
							cy={radius3 + 48}
						/>

				{/each}
		</svg>
	</div>
</div>