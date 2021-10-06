<svelte:head>
  <link rel="preload" href="./MajorMonoDisplay-Regular.ttf" as="font"
      type="font/ttf" crossorigin="anonymous">
  <link rel="preload" href="./XanhMono-Regular.ttf" as="font"
      type="font/ttf" crossorigin="anonymous">
</svelte:head>
<style>
	@import '../vars';

	:global(html) {
		font-family: 'xanh';
		letter-spacing: 1px;
	}

	:global(body) {
		margin: 0 !important;
	}

	#main-container {
		font-family: 'majormono';
		background: linear-gradient(80deg, $togoRed, $togoYellow, $togoGreen);
		display: flex;
		flex-direction: row;
	}

	#left-column {
		flex: 0 0;
		padding: 20px;
	}

	#right-column {
		flex: 1 1;
		margin: 4px;
	}

</style>

<script>
	import Loop from './logic/Loop.svelte';
	import NeutronDisplay from './NeutronDisplay.svelte';
	import TopBar from './TopBar.svelte';
	import UpgradeList from './UpgradeList.svelte';
	import Sidebar from './Sidebar.svelte';
	import FaqTab from './FaqTab.svelte';
	import ResearchTab from './ResearchTab.svelte';
	import TabSelector from './TabSelector.svelte';

	let selectedTab = 'MAIN';
	let changeTab = (newTab, x, xx, xxx) => {
		selectedTab = newTab;
	};
</script>

<div id="main-container">
	<Loop />
	<div id="left-column">
		<Sidebar />
  </div>
  <div id="right-column">
  	<TopBar />
  	<TabSelector
  		tabData={['MAIN', 'UPGRADES', 'RESEARCH', 'FAQ']}
  		selectedTab={selectedTab}
  		onClick={changeTab}
  	/>
    {#if selectedTab === 'MAIN'}<NeutronDisplay />
    {:else if selectedTab === 'UPGRADES'}<UpgradeList />
    {:else if selectedTab === 'RESEARCH'}<ResearchTab />
    {:else if selectedTab === 'FAQ'}<FaqTab />
    {/if}
  </div>
</div>
