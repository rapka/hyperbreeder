<style>
	.formatted-number {
		display: inline-block;
	}

	span {
		white-space: pre;
		display: inline-flex;
	}
</style>

<script>
	import options from '../../stores/optionStores';
	import formatNumber from '../logic/formatNumber';
	import AnimatedNumber from './AnimatedNumber.svelte';
	export let value = 1337;
	export let onComplete = () => {};
	let displayValue = value;
	let suffix = '';
	let formatted = {};

	$: {
		formatted = formatNumber(value);
		if ($options.fancyNumbers) {
			displayValue = formatted.value;
			suffix = formatted.suffix;
		} else {
			displayValue = value;
			suffix = '';
		}
	}
</script>

<div class="formatted-number">
	{#if $options.performanceMode === true}
		<span>{displayValue.toFixed(2)}{suffix}</span>
	{:else}
	<span>
		<AnimatedNumber value={displayValue} onComplete={onComplete} />
		{suffix}
		</span>
	{/if}
</div>
