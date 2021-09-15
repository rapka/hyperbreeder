<style>
	.pauseButton {
		background: $togoGreen;
	}

	.paused {
		background: $togoRed;
	}
</style>

<script>
	import classNames from 'classnames';
	import { pauseStatus } from '../stores';

	const pause = () => {
		pauseStatus.update(paused => !paused);
	};
</script>

<section class={classNames('pauseButton', { paused: $pauseStatus })} >
	<h1 on:click={pause}>{$pauseStatus ? "Start reactor" : "Turn off reactor"}</h1>
</section>
