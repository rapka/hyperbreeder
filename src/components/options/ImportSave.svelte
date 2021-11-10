<style>
	.importSave {
		display: flex;
		flex-direction: column;
		color: white;
	}

	.importSave-text {
		display: block;
		margin: 8px auto;
		resize: none;
	}

	.importSave-button {
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
	import { decodeSave } from '../../data/saveManagement';
	import { encodeSave } from '../../data/saveManagement';
	import { upgradeStatus as amUpgradeStatus, saveGame as amSaveGame, resources as amResources } from '../../stores/antimatterStores';
	import { upgradeStatus as mUpgradeStatus, saveGame as mSaveGame, resources as mResources } from '../../stores/matterStores';
	import tutorialStatus from '../../stores/tutorialStores';
	import options from '../../stores/optionStores';

	let value = '';
	let status = '';

	const importSave = () => {
		try {
			const saveJson = decodeSave(value);
			$mSaveGame = saveJson.mSaveGame;
			$mResources = saveJson.mResources;
			$mUpgradeStatus = saveJson.mUpgradeStatus;
			$amSaveGame = saveJson.amSaveGame;
			$amResources = saveJson.amResources;
			$amUpgradeStatus = saveJson.amUpgradeStatus;
			$options = saveJson.options;
			$tutorialStatus = saveJson.tutorialStatus;

			status = 'Save imported!';
		} catch (e) {
			status = `Save import error: ${e}`;
		}
	};
</script>

<div class="importSave">
	<textarea class="importSave-text" bind:value></textarea>
	<button class="importSave-button" on:click={importSave}>Import</button>
	<div class="importSave-status">{status}</div>
</div>
