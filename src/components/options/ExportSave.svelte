<style>
	.exportSave {
		width: 100%;
		color: white;
		display: flex;
		flex-direction: column;
	}

	.exportSave-text {
		display: block;
		margin: 8px auto;
		resize: none;
	}

	.exportSave-button {
		font-size: 20px;
    	padding: 8px;
    	max-width: 400px;
    	margin: auto;
    	color: white;
    	background: transparent;
    	border: 1px solid white;
	}
</style>

<script>
	import { encodeSave } from '../../data/saveManagement';
	import { upgradeStatus as amUpgradeStatus, saveGame as amSaveGame, resources as amResources } from '../../stores/antimatterStores';
	import { upgradeStatus as mUpgradeStatus, saveGame as mSaveGame, resources as mResources } from '../../stores/matterStores';
	import tutorialStatus from '../../stores/tutorialStores';
	import options from '../../stores/optionStores';

	let value = '';
	let status = '';

		try {
			const base64 = encodeSave({
				mSaveGame: $mSaveGame,
				mResources: $mResources,
				mUpgradeStatus: $mUpgradeStatus,
				amSaveGame: $amSaveGame,
				amResources: $amResources,
				amUpgradeStatus: $amUpgradeStatus,
				options: $options,
				tutorialStatus: $tutorialStatus,
			});
			value = base64;
		} catch (e) {
			status = `Save export error: ${e}`;
		}

	let exportSave = () => {
		try {
			navigator.clipboard.writeText(value);
			status = 'Save file copied.';
		} catch (e) {
			status = `Save export error: ${e}`;
		}
	};
</script>

<div class="exportSave">
	<textarea class="exportSave-text" bind:value></textarea>
	<button class="exportSave-button" on:click={exportSave}>Copy to clipboard</button>
	<div class="exportSave-status">{status}</div>
</div>
