<style>
	.expandButton {
		font-family: 'xanh';
		text-transform: uppercase;
		transform: rotate(0deg);
		transition: transform 200ms;
		cursor: pointer;
		text-align: center;
		user-select: none;
	}

	.open {
		transform: rotate(90deg);
	}
</style>

<script>
	export let open = false;
	export let onClick = () => {};
</script>

<div class={`expandButton${open ? ' open' : ''}`} on:click={() => onClick()}>
	&gt;
</div>

