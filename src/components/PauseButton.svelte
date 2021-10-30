<style>
	.pauseButton {
		background: black;
		padding: 16px 0;
		border-radius: 8px;
		margin-bottom: 8px 0;
		border: 2px solid white;
		color: white;
		cursor: default;
		user-select: none;
		text-align: center;
		display: flex;
		flex-direction: column;
		width: 100%;
		font-size: 28px;
	}

	.disabled {
		background: $togoRed;
		cursor: not-allowed;
		color: black;
		border: 2px solid black;
	}

	.waiting {
		text-align: center;
		background: $togoGreen;
		color: white;
		border: 2px solid white;
		cursor: pointer;
	}
</style>

<script>
	import classNames from 'classnames';
	import set from 'lodash/set';
	import times from 'lodash/times';
	import { resources as mResources } from '../stores/matterStores';
	import { resources as amResources } from '../stores/antimatterStores';
	import { currentStore } from '../stores';

	let text;
	let text2;
	let disabled;
	let waiting;
	let gameStatus;
	let isAm;

	$: {
		isAm = $currentStore.amDimension;
		gameStatus = $currentStore.gameStatus;
		waiting = $currentStore.resources.powerLevel === 0;
		disabled = gameStatus.startupTimer < 0;

		if (disabled) {
			text = isAm ? 'DARK MELTDOWN' : 'MELTDOWN';
			text2 = 'Waiting';
			times(1 + (gameStatus.startupTimer % 3), () => {
				text2 += '.';
			});
		} else if (waiting) {
			text = isAm ? 'Start Antireactor' : 'Start Reactor';
			text2 = `(${gameStatus.startupAmount})`;
		} else {
			text = isAm ? 'Operational' : 'Operational';
			text2 = '.';

			if (isAm) {
				times(4 - (gameStatus.startupTimer % 3), () => {
					text2 += '..';
				});
			} else {
				times(gameStatus.startupTimer % 5, () => {
					text2 += '..';
				});
			}
		}
	}

	const refuel = () => {
		if (disabled) {
			return;
		}
		if (isAm) {
			amResources.update(o => set(o, 'powerLevel', o.powerLevel + 100));
			amResources.update(o => set(o, 'energy', o.energy - gameStatus.startupAmount));
		} else {
			mResources.update(o => set(o, 'powerLevel', o.powerLevel + 100));
			mResources.update(o => set(o, 'energy', o.energy - gameStatus.startupAmount));
		}
	};
</script>

<div class={classNames('pauseButton', { waiting, disabled })} on:click={refuel} >
	<span>{text}</span>
	<span>{text2}</span>
</div>
