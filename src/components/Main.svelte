<svelte:head>
  <link rel="preload" href="../public/MajorMonoDisplay-Regular.ttf" as="font"
      type="font/ttf" crossorigin="anonymous">
  <link rel="preload" href="../public/XanhMono-Regular.ttf" as="font"
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

	p {
		font-family: 'majormono';
		color: white;
		background: black;
		font-size: 2em;
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
	}

</style>

<script>
	import Loop from './logic/Loop.svelte';
	import NeutronDisplay from './NeutronDisplay.svelte';
	import NeutronCounter from './NeutronCounter.svelte';
	import UpgradeList from './UpgradeList.svelte';
	import Sidebar from './Sidebar.svelte';
	import TabSelector from './TabSelector.svelte';

	let selectedTab = 'MAIN';
	let changeTab = (newTab, x, xx, xxx) => {
		console.log('inn', newTab, x, xx, xxx);
		selectedTab = newTab;
	};

	console.log('afm', selectedTab);

</script>

<div id="main-container">
	<Loop />
	<div id="left-column">
		<Sidebar />
  </div>
  <div id="right-column">
  	<NeutronCounter />
  	<TabSelector
  		tabData={['MAIN', 'UPGRADES', 'RESEARCH']}
  		selectedTab={selectedTab}
  		onClick={changeTab}
  	/>
    {#if selectedTab === 'MAIN'}<NeutronDisplay />
    {:else if selectedTab === 'UPGRADES'}<UpgradeList />
    {/if}
  </div>
</div>
