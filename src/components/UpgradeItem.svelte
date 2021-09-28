<style>
	@import '../vars';

	.upgradeItem {
		font-family: 'majormono';
		background: linear-gradient(80deg, $togoRed, $togoYellow, $togoGreen);
		padding: 4px;
		border-radius: 8px;
		min-width: 300px;
		border: 1px solid $togoRed;
		margin:  4px;
		opacity: 0.5;
		color:  white;
	}

	.isAfforable {
		opacity: 1;
		border: 1px solid white;
		cursor: pointer;
	}

	.purchased {
		opacity: 0.5;
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
</style>

<script>
	import { resources } from '../stores';
	import forEach from 'lodash/forEach';
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
		className = classNames('upgradeItem', { purchased, isAfforable });
		clickHandler = () => {
			(isAfforable && !purchased) ? onClick() : null;
		}

		isAfforable = map(cost, (c, key) => $resources[key] && $resources[key] >= c)
			.reduce((sum, next) => sum && next, true);
	}
</script>

<div class={className} on:click={onClick}>
	<div class="upgradeItem-title">{title}</div>
	<div class="upgradeItem-desc">{description}</div>
	<div class="upgradeItem-lore">{lore}</div>
</div>

