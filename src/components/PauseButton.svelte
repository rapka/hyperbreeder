<style>
	.pauseButton {
		background: $togoGreen;
		padding: 4px;
		border-radius: 8px;
		margin: 8px 0;
		cursor: pointer;
		user-select: none;
	}

	.paused {
		background: $togoRed;
	}
</style>

<script>
	import classNames from 'classnames';
	import { pauseStatus, startupTimer, startupTime } from '../stores';

	const pause = () => {
		pauseStatus.update(paused => !paused);
	};

	let text;

	$: {
		text = $pauseStatus ? 'Start reactor' : 'Power down';

		if (!$pauseStatus && $startupTimer < $startupTime) {
			text = 'Starting...';
		}
	}
</script>

<section class={classNames('pauseButton', { paused: $pauseStatus })} on:click={pause} >
	<h1 >{text}</h1>
</section>
