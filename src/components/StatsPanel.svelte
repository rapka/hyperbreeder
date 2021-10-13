<style>
	@import '../vars';

	.statsPanel {
		font-family: 'xanh';
		background: rgba(255, 255, 255, 0.7);
		padding: 4px;
		border: 1px solid white;
		min-width: 300px;
		font-size: 20px;
		width: 100%;
		margin-top: 16px;
		box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.8);
	}

	.statsPanel-header {
		text-transform: uppercase;
		display: flex;
		flex-direction: row;
		padding: 4px;
	}

	.statsPanel-details {
		font-size: 14px;
		padding-top: 4px;
	}
</style>

<script>
	import { gameStatus, kEff, kInf } from '../stores';
	import ExpandButton from './ui/ExpandButton.svelte';

	let expanded = false;

	const expandToggle = () => {
		expanded = !expanded;
	}
</script>

<div class="statsPanel">
	<span class="statsPanel-header">
		<ExpandButton open={expanded} onClick={expandToggle} class="statsPanel-expandButton" />
		Stats
	</span>
	<div>Power Level: {($kInf * 100).toFixed(2)}%</div>
	<div>Effeciency: {($kEff * 100).toFixed(2)}%</div>
	{#if expanded}
		<div class="statsPanel-details">
			Detailed Stats Breakdown
			<div>Resonance Escape Probability: {($gameStatus.p * 100).toFixed(2)}%</div>
			<div>Reproduction factor: {$gameStatus.n}</div>
			<div>Fast Fission Factor: {$gameStatus.e}</div>
			<div>Thermal Utilization Factor: {$gameStatus.f}</div>
			<div>Fast Non-leakage Probability: {($gameStatus.pf * 100).toFixed(2)}%</div>
			<div>Thermal Non-leakage Probability: {($gameStatus.pt * 100).toFixed(2)}%</div>
		</div>
	{/if}
</div>

