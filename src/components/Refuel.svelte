<style>
	.refuelButton {
		background: $togoGreen;
		padding: 4px;
		border-radius: 8px;
		margin: 8px 0;
		cursor: pointer;
		user-select: none;
	}
</style>

<script>
	import classNames from 'classnames';
	import set from 'lodash/set';
	import { resources } from '../stores';

	const refuel = () => {
		resources.update(o => set(o, 'powerLevel', o.powerLevel + 100));
		resources.update(o => set(o, 'energy', o.energy - 1000));
	};
</script>

<section class="refuelButton" on:click={refuel} >
	<h1>Refuel</h1>
</section>
