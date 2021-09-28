<style>
	@import '../vars';

	.upgradeList {
		font-family: 'majormono';
		background: rgba(0, 0, 0, 0.75);
		padding: 4px;
		border-radius: 8px;
		min-width: 300px;
		color: white;
	}

	.upgradeList-header {
		padding: 4px;
	}
</style>

<script>
	import { upgradeStatus, resources } from '../stores';
	import UpgradeItem from './UpgradeItem.svelte';
	import forEach from 'lodash/forEach';

	const buyUpgrade = (upgradeObject, index) => {
		upgradeObject.purchased = true;

		upgradeStatus.update(statusObject => {
			console.log('statusObject', statusObject);
			statusObject[index] = upgradeObject;
			console.log('statusObject2', statusObject);
			return statusObject;
		});

		resources.update(resourcesObj => {
			console.log('resourcesObj', resourcesObj);
			forEach(resourcesObj, (resource, key) => {
				if (upgradeObject.cost[key]) {
					resourcesObj[key] -= upgradeObject.cost[key];
				}
			});

			console.log('resourcesObj2', resourcesObj);
			return resourcesObj;
		});
	};
</script>

<section class="upgradeList">
	<div class="upgradeList-header">UPGRADES</div>
	{#each $upgradeStatus as upgrade, index}
		<UpgradeItem {...upgrade} onClick={() => buyUpgrade(upgrade, index)} />
	{/each}
</section>

