<style>
	@import '../vars';

	.loreTicker {
		overflow: hidden;
		display: flex;
		flex-direction: row;
		margin: 4px 0;
	}

	.loreTicker-label {
		border: 1px solid white;
	}

	.loreTicker span {
	  display: inline-block;
	  width: max-content;
	  white-space: pre;
	  max-width: 500px;
		overflow: hidden;
	}
</style>

<script>
	import sample from 'lodash/sample';
	import { currentStore } from '../stores';
	import format from 'date-fns/format';
	import nextLoreTickerLine from '../data/nextLoreTickerLine';

	const TEXT_PADDING = '             ';

	let nextLine = nextLoreTickerLine($currentStore.gameStatus);

	let text = `${' '.repeat(nextLine.length)}${nextLine}`;
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
