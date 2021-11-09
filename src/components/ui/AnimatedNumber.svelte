<style>
	.animated-number {
		display: inline-block;
	}
</style>

<script>
	export let value = 1337;
	export let onComplete = () => {};
	let currentValue = value;
	let letterDelay = 20;
	let valueInterval;
	// let maxIterations = 9 - 2 * $options.textSpeed;
	let maxIterations = 10;
	let currentIteration = 1;

  // export let value;
  let prevValue;

	const loop = () => {
		if (currentValue === value || currentIteration === maxIterations) {
			currentValue = value;
			currentIteration = 1;
			onComplete();
			return;
		}

		currentValue += valueInterval;
		currentIteration++;

		setTimeout(function() {
			loop();
		}, letterDelay);
	};

  $: {

		if (prevValue !== value) {
			valueInterval = parseInt((value - prevValue) / maxIterations);
			prevValue = value;
			loop();
		}
	}
</script>

<div class="animated-number">
	{Math.round(currentValue * 100) / 100}
</div>
