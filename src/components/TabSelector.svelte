<style>
	.tabSelector {
		background: $togoGreen;
		margin: 4px 4px 0 4px;
		border-radius: 8px;
		user-select: none;
		display: flex;
		flex-direction: row;
	}

	.tab {
		display: inline-block;
		background: $togoRed;
		padding: 8px;
		flex: 1 0;
		border: 1px solid white;
		cursor: pointer;
	}

	.selected {
		cursor: default;
		background: white;
		color: black;
	}
</style>

<script>
	import classNames from 'classnames';

	export let tabData = [];
	export let selectedTab = 'MAIN';
	export let onClick = () => {};

	console.log('aaa', selectedTab);
</script>

<div class="tabSelector">
	{#each tabData as tab, index}
		<div
			class={classNames('tab', { selected: tab === selectedTab })}
			on:click={() => onClick(tab)}
			>{tab}</div>
	{/each}
</div>
