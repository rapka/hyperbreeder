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
	import { saveGame } from '../stores';
	import ControlRod from './ControlRod.svelte';
	import forEach from 'lodash/forEach';

	const toggleRod = (index) => {
		// Update rod status
		saveGame.update(save => {
			save.controlRods[index] = !save.controlRods[index];
			return save;
		});
	};
</script>

<section class="controlRodList">
	{#each $saveGame.controlRods as rod, index}
		<ControlRod
			active={rod}
			onClick={() => toggleRod(index)}
			displayName={`ctrl rod ${('00' + (index + 1)).slice(-3)}`}
		/>
	{/each}
</section>

