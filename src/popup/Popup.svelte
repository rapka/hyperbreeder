<style>
	#popup {
		z-index: 101;
		background: rgba(0,0,0,0.3);
		display: flex;
		flex-direction: column;
		width: 100vw;
		height: 100vh;
		justify-content: center;
		align-items: center;
		color: white;
		position: fixed;
	}

	#popup-overlay {
		z-index: 100;
		display: flex;
		flex-direction: column;
		width: 100vw;
		height: 100vh;
		position: fixed;
		background: url('noise.svg');
		opacity: 0.2;
	}

	#popup-text-overlay {
		z-index: -1;
		width: 100%;
		height: 100%;
		position: absolute;
		background-image: url('noise.svg');
		opacity: 0.2;
	}

	#popup-contents-container {
		z-index: 101;
		font-family: 'majormono';
		font-size: 96px;
		text-align: center;
		flex: 0 0;
		border: 2px solid white;
		width: calc(100% - 60px);
		position: relative;
		background: rgba(0, 0, 0, 0.75);
		box-shadow: 0 0 150px #000;
	}

	#popup-contents {
		z-index: 101;
	}

	#popup-title {
		text-transform: uppercase;
		font-family: 'xanh';
		letter-spacing: 8px;
		font-size: 24px;
		padding-top:  16px;
		width: 100%;
		text-align: center;
		flex: 0 0;
	}

	#popup-desc {
		font-family: 'xanh';
		letter-spacing: 5px;
		font-size: 16px;
		padding-top: 16px;
		width: 100%;
		text-align: center;
		flex: 0 0;
	}

	#popup-dismiss {
		cursor: pointer;
		background: black;
		font-size: 24px;
		border: 1px solid white;
		padding: 8px;
	}

	.dismiss-container {
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		padding: 16px 0;
		flex: 0 0;
	}

</style>

<script>
	import isEmpty from 'lodash/isEmpty';
	import AnimatedText from '../components/ui/AnimatedText.svelte';
	import { popupText, popupStatus } from '../stores/popupStatus';
	export let onDismiss = () => {};

	let dismiss = () => {
		onDismiss($popupStatus);
		$popupStatus = '';
	}

	let descPlaying = false;
	let onTitleComplete = () => {
		setTimeout(() => {
			descPlaying = true;
		}, 100);
	}
</script>

<div id="popup-container">
	{#if isEmpty($popupText) === false}
		<div id="popup">
			<div id="popup-overlay" />
			<div id="popup-contents-container">
				<div id="popup-text-overlay" />
				<div id="popup-contents">
					<div id="popup-title">
						<AnimatedText
							text={$popupText.title}
							onComplete={onTitleComplete}
						/>
					</div>
					<div id="popup-desc">
						<AnimatedText
							text={$popupText.text}
							playing={descPlaying}
						/>
					</div>
					<div class="dismiss-container">
						<div id="popup-dismiss" on:click={dismiss}>
							{$popupText.dismissText}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
