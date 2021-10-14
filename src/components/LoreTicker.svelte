<style>
	@import '../vars';

	.marquee {
		max-width: 300px;
		overflow: hidden;
		/*display: none;*/
	}

	.marquee span {
	  display: inline-block;
	  width: max-content;

	  padding-left: 100%;
	  /* show the marquee just outside the paragraph */
	  will-change: transform;
	  animation: marquee 15s linear infinite;

	}

	.marquee span:hover {
	  animation-play-state: paused
	}


	@keyframes marquee {
	  0% { transform: translateX(0); }
	  100% { transform: translateX(-100%); }
	}
</style>

<script>
	import sample from 'lodash/sample';
	import { gameStatus } from '../stores';
	import getDateFromTicks from './logic/getDateFromTicks';
	import getYear from 'date-fns/getYear';
	import format from 'date-fns/format';
	import nextLoreTickerLine from '../data/nextLoreTickerLine';
	import { onDestroy } from 'svelte';

	let text = nextLoreTickerLine(gameStatus);
	const interval = setInterval(() => {
		text = nextLoreTickerLine(gameStatus);
	}, 1500);

	onDestroy(() => clearInterval(interval));

</script>

<p class="marquee">
<span>
    {text}
</span>
</p>
