<style>
	.tabSelector {
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
		color: white;
		text-shadow: 1px 1px 5px white;
		cursor: pointer;
		font-size: 20px;
		text-transform: uppercase;
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
</script>

<div class="tabSelector">
	{#each tabData as tab, index}
		<div
			class={classNames('tab', { selected: tab === selectedTab })}
			on:click={() => onClick(tab)}
			>{tab}</div>
	{/each}
</div>
