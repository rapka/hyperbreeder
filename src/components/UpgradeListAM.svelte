<style>
	@import '../vars';

	.upgradeList {
		font-family: 'majormono';
		background: rgba(0, 0, 0, 0.75);
		padding: 4px;
		min-width: 300px;
		color: white;
		overflow: scroll;
		max-height: calc(100vh - 110px);
	}

	.upgradeList-header {
		padding: 4px;
	}
</style>

<script>
	import { upgradeStatus, resources, unlockedUpgrades } from '../stores/antimatterStores';
	import UpgradeItem from './UpgradeItem.svelte';
	import forEach from 'lodash/forEach';

	const buyUpgrade = (upgradeObject, index) => {
		upgradeObject.purchased = true;

		// Update purchase status
		upgradeStatus.update(statusObject => {
			statusObject[index] = upgradeObject;
			return statusObject;
		});

		// Subtract cost
		resources.update(resourcesObj => {
			forEach(resourcesObj, (resource, key) => {
				if (upgradeObject.cost[key]) {
					resourcesObj[key] -= upgradeObject.cost[key];
				}
			});

			return resourcesObj;
		});
	};
</script>

<section class="upgradeList">
	<div class="upgradeList-header">UPGRADES</div>
	{#each $upgradeStatus as upgrade, index}
		{#if $unlockedUpgrades.includes(upgrade.id)}
			<UpgradeItem {...upgrade} onClick={() => buyUpgrade(upgrade, index)} />
		{/if}
	{/each}
</section>

