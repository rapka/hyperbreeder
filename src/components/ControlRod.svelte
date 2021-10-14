<style>
	@import '../vars';

	.controlRod {
		font-family: 'xanh';
		background: rgba(0, 0, 0, 0.9);
		min-width: 30px;
		line-height: 30px;
		text-align: center;
		border: 1px solid white;
		margin: 4px 8px;
		color:  white;
		position: relative;
		cursor: pointer;
		user-select: none;
		display: flex;
		flex-direction: row;
	}

	.active {
		border: 1px solid #BBB;
		color: #BBB;
	}

	.controlRod-display {
		display: flex;
		flex-direction: row;
		margin: 6px 0;
		writing-mode: vertical-lr;
		text-orientation: upright;
		text-transform: uppercase;
		letter-spacing: -3px;
	}

	.controlRod-icon {
		text-align: center;
		line-height: 30px;
		width: 30px !important;
		height: calc(100% - 30px);
		transition: transform 250ms ease-in-out;
		transform: translate(-4px, -15px);
		background: $togoGreen;
		margin-right: 4px;
		filter: drop-shadow(0 0 10px $togoGreen);
	}

	.active .controlRod-icon {
		transform: translate(-4px, 25px);
		filter: none;
		content: 'X';
		background: $togoRed;
		filter: drop-shadow(0 0 4px $togoRed);
	}
</style>

<script>
	import { resources } from '../stores';
	import forEach from 'lodash/forEach';
	import map from 'lodash/map';
	import classNames from 'classnames';

	export let active;
	export let displayName;
	export let onClick = () => undefined;

	let className;

	$: {
		className = classNames('controlRod', { active });
	}
</script>

<div class={className} on:click={onClick}>
	<div class="controlRod-icon">{' '}</div>
	<div class="controlRod-display">{displayName}</div>
</div>

