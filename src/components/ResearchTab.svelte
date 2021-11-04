<style>
	@import '../vars';

	.researchTab {
		font-family: 'xanh';
		background: rgba(0, 0, 0, 0.75);
		min-width: 300px;
		color: white;
		padding: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.track {
		opacity: 0.3;
		stroke: white;
		width: 800px;
  		animation: glow 3s linear alternate infinite;
	}

	.dot {
		width: 800px;
		stroke: white;
		position: absolute;
		z-index: 10;
  		animation: loop 5s cubic-bezier(1, .01, 0.03, 1) normal infinite;
  		filter: drop-shadow(0 0 10px #FFF);
  		stroke-dasharray: 100 1235;
	}

	.active .dot {
		stroke: $togoRed;
		animation-duration: 2s;
	}

	.active .track {
		stroke: $togoRedDimmed;
	}

	@keyframes glow {
	  from {
	    filter: drop-shadow(0 0 20px #FFF);
	  }
	  to {
	    filter: drop-shadow(0 0 10px #AAA);
	  }
	}

	@keyframes loop {
	  to {
  		stroke-dashoffset: 1335;
	  }
	}

	button {
		position: absolute;
		top: 400px;
		left: 400px;
	}
</style>

<script>
	import classNames from 'classnames';
	// import { upgradeStatus, resources } from '../stores';

	let active = false;

	const activate = () => {
		if (!active) {
			active = true;

			setTimeout(() => { active = false; }, 7000);
		}
	};
</script>

<section class={classNames('researchTab', { active })}>
	<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" class="track">
		<ellipse cx="400" cy="200" rx="300" ry="100" fill="none" stroke-width="5" />
	</svg>
	<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" class="dot">
		<ellipse cx="400" cy="200" rx="300" ry="100" fill="none" stroke-width="5" />
	</svg>
	<button on:click={activate}>SpIN</button>
</section>

