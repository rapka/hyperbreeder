<style>
	.animated-text {
	}

	span {
		white-space: pre;
	}
</style>

<script>
	import options from '../../stores/optionStores';
	export let text = 'TEST TEXT';
	export let onComplete = () => {};
	export let slowMode = true;
	export let playing = true;
	let currentText = [];
	let animationComplete = false;
	let textArray = [];
	let letterDelay = 10;
	let intervalTime = 30;
	let maxIterations = 9 - 2 * $options.textSpeed;

	const loop = (a, index) => {
		let c, interval, g, h, count;
		count = 0;

		if (index === a.length) {
			animationComplete = true;
			onComplete();
		} else {
			g = currentText;
			h = Math.floor(21 * Math.random() + 5);
			c = 32 === a[index] ? 32 : a[index] - h;
			interval = setInterval(function() {
				count++;
				currentText = g.concat([String.fromCharCode(c)]);

				if (count === maxIterations) {
					currentText = text.slice(0, currentText.length);
					clearInterval(interval);
					count = 0;
					c = 32;
					index++;
					setTimeout(function() {
						loop(a, index);
					}, letterDelay);
				} else {
					c++;
				}
			}, intervalTime);
		}
	};

	for (let d = text, c = 0;c < d.length; c++) {
		textArray.push(d.charCodeAt(c));
	}

	$: {
		if (playing) {
			loop(textArray, 0);
		}
	}
</script>

<div class="animated-text">
	{#each text as char, index}
		{#if index < currentText.length}
			<span>{currentText[index]}</span>
		{:else}
			<span>{' '}</span>
		{/if}
	{/each}
</div>
