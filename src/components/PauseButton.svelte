<style>
	.pauseButton {
		background: black;
		padding: 16px 4px;
		border-radius: 8px;
		margin: 8px 0;
		border: 2px solid white;
		color:  white;
		cursor: default;
		user-select: none;
		text-align: center;
		width: 100%;
		font-size: 30px;
	}

	.disabled {
		background: $togoRed;
		cursor: not-allowed;
	}

	.waiting {
		background: $togoGreen;
		cursor: pointer;
	}
</style>

<script>
	import classNames from 'classnames';
	import set from 'lodash/set';
	import { pauseStatus, startupTimer, startupTime, resources } from '../stores';

	let text;
	let disabled;
	let waiting;

	$: {
		waiting = $resources.powerLevel === 0;
		disabled = $startupTimer < 0;

		if (disabled) {
			text = 'MELTDOWN (waiting)';
		} else if (waiting) {
			text = 'Start reactor';
		} else {
			text = 'operational';
		}
	}

	const refuel = () => {
		if (disabled) {
			return;
		}

		resources.update(o => set(o, 'powerLevel', o.powerLevel + 100));
		resources.update(o => set(o, 'energy', o.energy - 1000));
	};
</script>

<div class={classNames('pauseButton', { waiting, disabled })} on:click={refuel} >
	{text}
</div>
