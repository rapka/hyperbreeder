<style>
	.pauseButton {
		background: black;
		padding: 4px;
		border-radius: 8px;
		margin: 8px 0;
		border: 1px solid white;
		color:  white;
		cursor: pointer;
		user-select: none;
		text-align: center;
	}

	.disabled {
		background: $togoRed;
	}

	.waiting {
		background: $togoGreen;
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

<section class={classNames('pauseButton', { waiting, disabled })} on:click={refuel} >
	<h1>{text}</h1>
</section>
