<style>
	#game-container {
		font-family: 'majormono';
		background: linear-gradient(80deg, $togoRedDimmed, $togoYellow, $togoGreen);
		display: flex;
		flex-direction: row;
		height: 100vh;
		width: 100vw;
	}

	#left-column {
		flex: 0 0;
		padding: 24px;
	}

	#right-column {
		flex: 1 1;
		margin: 4px;
	}

	#tabSelector-container {
		box-shadow: 0 0 30px rgba(0, 0, 0, 0.75);
		margin: 8px 4px;
	}
</style>

<script>
	import Loop from './logic/Loop.svelte';
	import NeutronDisplay from './NeutronDisplay.svelte';
	import UpgradeList from './UpgradeList.svelte';
	import Sidebar from './Sidebar.svelte';
	import FaqTab from './FaqTab.svelte';
	import ResearchTab from './ResearchTab.svelte';
	import TabSelector from './TabSelector.svelte';
	import RefuelTab from './RefuelTab.svelte';

	let selectedTab = 'MAIN';
	let changeTab = (newTab, x, xx, xxx) => {
		selectedTab = newTab;
	};
</script>

<div id="game-container">
	<Loop />
	<div id="left-column">
		<Sidebar />
	</div>
	<div id="right-column">
		<div id="tabSelector-container">
		<TabSelector
			tabData={['MAIN', 'UPGRADES', 'REFUEL', 'RESEARCH', 'FAQ']}
			selectedTab={selectedTab}
			onClick={changeTab}
		/>
			{#if selectedTab === 'MAIN'}<NeutronDisplay />
			{:else if selectedTab === 'UPGRADES'}<UpgradeList />
			{:else if selectedTab === 'RESEARCH'}<ResearchTab />
			{:else if selectedTab === 'REFUEL'}<RefuelTab />
			{:else if selectedTab === 'FAQ'}<FaqTab />
			{/if}
  	</div>
  </div>
</div>
