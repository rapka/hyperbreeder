<style>
	@import '../vars';

	.upgradeItem {
		font-family: 'xanh';

		padding: 4px;
		border-radius: 8px;
		min-width: 300px;
		border: 1px solid $togoRed;
		margin: 6px 4px;
		opacity: 0.5;
		color:  white;
		position: relative;
		overflow: hidden;
	}

	.isAfforable {
		opacity: 1;
		border: 1px solid white;
		cursor: pointer;
	}

	.purchased {
		cursor: default;
	}

	.upgradeItem-title {
		font-size: 16px;
	}

	.upgradeItem-desc {
		font-size: 14px;
	}

	.upgradeItem-lore {
		color: $togoYellow;
		font-size: 12px;
		opacity: 0.5;
	}

	.upgradeItem-cost {
		font-size: 14px;
	}

	.upgradeItem-purchased {
		z-index: 1;
		background: rgba(0, 0, 0, 0.9);
		opacity: 0.8;
		width: 100%;
		padding: 100px;
		transform: rotate(-5deg);
		top: -130px;
		left: -18px;
		text-transform: uppercase;
		position: absolute;
		font-size: 50px;
		letter-spacing: 20px;
	}

	.upgradeItem-costResource {
		margin-right: 8px;
	}
</style>

<script>
	import { currentStore } from '../stores';
	import map from 'lodash/map';
	import classNames from 'classnames';

	export let title;
	export let description;
	export let lore;
	export let cost;
	export let purchased = false;
	export let onClick = () => undefined;

	let isAfforable = true;

	let className;
	let clickHandler;

	$: {
		isAfforable = map(cost, (c, key) => $currentStore.resources[key] && $currentStore.resources[key] >= c)
			.reduce((sum, next) => sum && next, true);

		className = classNames('upgradeItem', { isAfforable: isAfforable && !purchased, purchased });
		clickHandler = () => {
			(isAfforable && !purchased) ? onClick() : null;
		}
	}
</script>

<div class={className} on:click={clickHandler}>
	<div class="upgradeItem-title">{title}</div>
	<div class="upgradeItem-desc">{description}</div>
	<div class="upgradeItem-lore">{lore}</div>
	{#if purchased}
		<div class="upgradeItem-purchased">Purchased</div>
	{/if}
	<div class="upgradeItem-cost">Cost:
	{#each Object.entries(cost) as [costResource, costAmount]}
			<span class="upgradeitem-costAmount">{costAmount}</span>
			<span class="upgradeitem-costResource">{costResource}</span>
		{/each}
	</div>
</div>

