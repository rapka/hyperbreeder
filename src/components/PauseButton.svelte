<style>
	.pauseButton {
		background: $togoGreen;
		padding: 4px;
		border-radius: 8px;
		margin: 8px 0;
		border: 1px solid white;
		color:  white;
		cursor: pointer;
		user-select: none;
	}

	.danger {
		background: $togoGreen;
	}
</style>

<script>
	import classNames from 'classnames';
	import set from 'lodash/set';
	import { pauseStatus, startupTimer, startupTime, resources } from '../stores';


	let text;
	let disabled;

	$: {
		text = $resources.powerLevel > 0 ? 'Reactor started' : 'Start reactor';

		if ($startupTimer < 0) {
			text = 'MELTDOWN (waiting)';
			disabled = true;
		} else {
			disabled = false;
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

<section class={classNames('pauseButton', { disabled })} on:click={refuel} >
	<h1>{text}</h1>
</section>
