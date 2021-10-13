<style>
	@import '../vars';

	.upgradeItem {
		font-family: 'xanh';
		background: linear-gradient(80deg, $togoGreen, $togoYellow, $togoRed);
		padding: 4px;
		border-radius: 8px;
		min-width: 300px;
		border: 1px solid $togoRed;
		margin:  4px;
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
		font-size: 12px;
		opacity: 0.5;
	}

	.upgradeItem-cost {
		font-size: 14px;
	}

	.upgradeItem-purchased {
		z-index: 1;
		background: rgba(0, 0, 0, 0.9);
		opacity: 0.75;
		width: 100%;
		padding: 100px;
		transform: rotate(-5deg);
		top: -130px;
		left: -20px;
		text-transform: uppercase;
		position: absolute;
		font-size: 50px;
		letter-spacing: 20px;
	}
</style>

<script>
	import { resources } from '../stores';
	import forEach from 'lodash/forEach';
	import map from 'lodash/map';
	import classNames from 'classnames';

	// export let id;
	// export let apply;
	// export let requirements;
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
		isAfforable = map(cost, (c, key) => $resources[key] && $resources[key] >= c)
			.reduce((sum, next) => sum && next, true);

		className = classNames('upgradeItem', { isAfforable, purchased });
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
	<div class="upgradeItem-cost">Cost: {JSON.stringify(cost)}</div>
</div>

