<style>
	@import '../vars';

	.faqTab {
		font-family: 'xanh';
		background: rgba(0, 0, 0, 0.75);
		padding: 16px;
		min-width: 300px;
		color: white;
	}

	.faqTab-changelog {
		border: 1px solid white;
		padding: 8px;
	}

	.faqTab-changelogButton {
		margin: 16px 0;
		font-size: 20px;
		display: flex;
		flex-direction: row;
	}
</style>

<script>
	import ExpandButton from './ui/ExpandButton.svelte';

	let expanded = false;

	const expandToggle = () => {
		expanded = !expanded;
	}
</script>

<section class="faqTab">
	<p>Hyperbreeder is an idle game about generating power. This is a very, very, very early version of the game! It is not yet ready to be fun for long periods of time.</p>

	<p>Clicking the big green "start reactor" button will begin generating energyover time. Energy can be used for upgrades and is additionally used for the initial reactor startup. If the power level reaches maximum, the reactor will automatically shut down and you will have to wait to start up again. Starting or restarting the reactor requires 1000 energy.</p>

	<p>Every year, a certain amount of energy must be budgeted for the earth rather than upgrades. Failing to meet this goal will cause fossil fuels to be used instead causing a huge increase in waste.

	<p>Running the reactor generates poison over time, which reduces efficiency. This can be counteracted by adjusting the control rods at the bottom of the screen: each rod in the up position increases overall reactor power. Poison takes time to both build up and dissipate.</p>

	<p>The Reactor also generates waste, which is currently unused.</p>

	<p>Save files are not yet implemented. You will lose all progress if you refresh!</p>

	<p class="faqTab-changelogButton" on:click={expandToggle}>
		<ExpandButton open={expanded} class="faqTab-expandButton" />
		View patch notes / Changelog
	</p>
	{#if expanded}
		<p class="faqTab-changelog">
			Changelog info will live here!
		</p>
	{/if}
</section>

