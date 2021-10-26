<style>
	.antimatterToggle {
		background: $togoGreen;
		border-radius: 8px;
		user-select: none;
		display: flex;
		flex-direction: row;
	}

	.tab {
		display: inline-block;
		background: linear-gradient(45deg, $togoBlue, $togoBlue, $togoPink);
		padding: 8px;
		flex: 1 0;
		border: 1px solid white;
		border-bottom: 0;
		color: white;
		text-shadow: 1px 1px 5px white;
		cursor: pointer;
		font-size: 18px;
		text-transform: uppercase;
	}

	.selected {
		cursor: default;
		background: white;
		color: black;
	}

	.active {
		transform: rotate(90deg);
	}
</style>

<script>
	import classNames from 'classnames';
	import { amDimension } from '../stores';

	export let active = false;
	export let onClick = () => {
		$amDimension = !$amDimension;
	};
</script>

<div class={`antimatterToggle${active ? ' active' : ''}`} on:click={() => onClick()}>
	TO ANTIMATTER VERSE
</div>
