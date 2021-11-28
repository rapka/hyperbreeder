<style>
	@import '../vars';

	.loreTicker {
		overflow: hidden;
		display: flex;
		flex-direction: row;
		margin: 8px 8px 4px 0;
		border: 1px solid white;
		background: rgba(0, 0, 0, 0.5);
	}

	.loreTicker-label {
		background: white;
		color: black;
		border-right: 1px solid white;
		padding-right: 12px;
	}

	.loreTicker span {
		padding-left: 1px;
		color: white;
		display: inline-block;
		width: max-content;
		white-space: pre;
		max-width: 607px;
		overflow: hidden;
	}
</style>

<script>
	import { currentStore } from '../stores';
	import nextLoreTickerLine from '../data/nextLoreTickerLine';

	const TEXT_PADDING = '                ';

	let nextLine = nextLoreTickerLine($currentStore.gameStatus);

	// let text = `${' '.repeat(nextLine.length)}${nextLine}`;
	let text = TEXT_PADDING + nextLine;
	let rotated = text;

	function rotate(text, noOfChars = 0){
		if (noOfChars <= text.length) {
			setTimeout(() => rotate(text, noOfChars + 1), 250);
		} else {
			nextLine = nextLoreTickerLine($currentStore.gameStatus);
			text = `${' '.repeat(nextLine.length)}${nextLine}`;
			setTimeout(() => rotate(text, 0), 250);
		}

	  const n = noOfChars % text.length;
	  rotated = text.slice(n) + text.slice(0, n);
	}

	rotate(text, 0);
</script>

<div class="loreTicker">
	<div class="loreTicker-label">
		World News Updates
	</div>
	<span class="loreTicker-content">
	    {rotated}
	</span>
</div>

