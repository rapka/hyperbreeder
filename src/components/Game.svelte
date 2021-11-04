<style>
	#game-container {
		font-family: 'majormono';
		background: linear-gradient(80deg, var(--color-primary-1), var(--color-primary-2), var(--color-primary-3));
		display: flex;
		flex-direction: row;
		height: 100vh;
		width: 100vw;
	}

	#left-column {
		flex: 0 0;
		min-width: 400px;
	}

	#right-column {
		flex: 1 1;
		margin-left: 16px;
	}

	#tabSelector-container {
		box-shadow: 0 0 30px rgba(0, 0, 0, 0.75);
		margin: 8px 8px 8px 0;
	}

	.amDimension {
		--color-primary-1: #{$togoBlue};
		--color-primary-2: #{$togoPink};
		--color-primary-3: #{$togoCyan};
	}
</style>

<script>
	import LoopM from './logic/LoopM.svelte';
	import LoopAM from './logic/LoopAM.svelte';
	import NeutronDisplay from './NeutronDisplay.svelte';
	import UpgradeListM from './UpgradeListM.svelte';
	import UpgradeListAM from './UpgradeListAM.svelte';
	import Sidebar from './Sidebar.svelte';
	import FaqTab from './FaqTab.svelte';
	import ResearchTab from './ResearchTab.svelte';
	import TabSelector from './TabSelector.svelte';
	import OverviewTab from './OverviewTab.svelte';
	import LoreTicker from './LoreTicker.svelte';
	import { amDimension } from '../stores';
	import Popup from '../popup/Popup.svelte';

	let selectedTab = 'MAIN';


	let changeTab = (newTab, x, xx, xxx) => {
		selectedTab = newTab;
	};

</script>

<div id="game-container" class="game-container" class:amDimension={$amDimension}>
	<Popup />
	<LoopM />
	<LoopAM />
	<div id="left-column">
		<Sidebar />
	</div>
	<div id="right-column">
		<LoreTicker />
		<div id="tabSelector-container">
		<TabSelector
			tabData={['MAIN', 'OVERVIEW', 'UPGRADES', 'RESEARCH', 'FAQ']}
			selectedTab={selectedTab}
			onClick={changeTab}
		/>
			{#if selectedTab === 'MAIN'}<NeutronDisplay />
			{:else if selectedTab === 'OVERVIEW'}<OverviewTab />
			{:else if selectedTab === 'UPGRADES'}
				{#if $amDimension}
					<UpgradeListAM />
				{:else}
					<UpgradeListM />
				{/if}
			{:else if selectedTab === 'RESEARCH'}<ResearchTab />

			{:else if selectedTab === 'FAQ'}<FaqTab />
			{/if}
  		</div>
  </div>
</div>
