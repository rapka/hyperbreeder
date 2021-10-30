<style>
	.antimatterToggle {
		background: rgba(0, 0, 0, 0.3);
		border-image: repeating-linear-gradient(80deg, $togoPink, $togoCyan, $togoBlue) 20 / 1.5 / 0 stretch;
		border-radius: 8px;
		user-select: none;
		cursor: pointer;
		width: 100%;
		color: white;
		text-shadow: 1px 1px 5px white;
		text-align: center;
		padding: 16px 0;
		margin: 16px 0;
		box-shadow: 0 0 16px rgba(0, 0, 0, 0.8);
		border-style: solid;
	}

	.active {
		background: rgba(255, 255, 255, 0.7);
		box-shadow: 0 0 16px rgba(255, 255, 255, 0.8);
		color: black;
		text-shadow: 1px 1px 5px black;
		border-image: repeating-linear-gradient(80deg, $togoRed, $togoYellow, $togoGreen) 20 / 1.5 / 0 stretch;

	}
</style>

<script>
	import classNames from 'classnames';
	import { amDimension } from '../stores';

	let text;

	export let onClick = () => {
		$amDimension = !$amDimension;
	};

	$: {
		text = $amDimension ? 'Return to matter dimension' : 'Traverse to antimatter dimsension';
	}
</script>

<div class={`antimatterToggle${$amDimension ? ' active' : ''}`} on:click={() => onClick()}>
	{text}
</div>
