<style>
	@import '../vars';

	.controlRodList {
		font-family: 'majormono';
		background: rgba(0, 0, 0, 0.75);
		padding: 16px 4px;
		min-width: 300px;
		color: white;
		display: flex;
		flex-direction: row;
	}
</style>

<script>
	import { controlRods } from '../stores';
	import ControlRod from './ControlRod.svelte';
	import forEach from 'lodash/forEach';

	const toggleRod = (index) => {
		// Update purchase status
		controlRods.update(rods => {
			rods[index] = !rods[index];
			return rods;
		});
	};
</script>

<section class="controlRodList">
	{#each $controlRods as rod, index}
		<ControlRod
			active={rod}
			onClick={() => toggleRod(index)}
			displayName={`ctrl rod ${('00' + (index + 1)).slice(-3)}`}
		/>
	{/each}
</section>

