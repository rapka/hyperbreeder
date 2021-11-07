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
	import { saveGame as mSaveGame } from '../stores/matterStores';
	import { saveGame as amSaveGame } from '../stores/antimatterStores';
	import { amDimension } from '../stores';
	import ControlRod from './ControlRod.svelte';
	import forEach from 'lodash/forEach';

	const togglemRod = (index) => {
		// Update rod status
		mSaveGame.update(save => {
			save.controlRods[index] = !save.controlRods[index];
			return save;
		});
	};

	const toggleamRod = (index) => {
		// Update rod status
		amSaveGame.update(save => {
			save.controlRods[index] = !save.controlRods[index];
			return save;
		});
	};
</script>

<section class="controlRodList">
	{#if $amDimension}
		{#each $amSaveGame.controlRods as rod, index}
			<ControlRod
				active={rod}
				onClick={() => togglemRod(index)}
				displayName={`ctrl rod ${('00' + (index + 1)).slice(-3)}`}
			/>
		{/each}
	{:else}
		{#each $mSaveGame.controlRods as rod, index}
			<ControlRod
				active={rod}
				onClick={() => toggleamRod(index)}
				displayName={`ctrl rod ${('00' + (index + 1)).slice(-3)}`}
			/>
		{/each}
	{/if}
</section>

