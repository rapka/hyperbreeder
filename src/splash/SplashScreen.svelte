<style>
	#splash-screen {

		background: linear-gradient(80deg, $togoRed, $togoYellow, $togoGreen);
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100vh;
		justify-content: center;
		align-items: center;
		color: white;
	}

	#splash-logo {
		text-transform: uppercase;
		font-family: 'majormono';
		letter-spacing: 32px;
		font-size: 96px;
		text-align: center;
		width: 100%;
		background: black;
		mix-blend-mode: darken;
		flex: 0 0;
	}

	#splash-description {
		text-transform: uppercase;
		font-family: 'xanh';
		letter-spacing: 8px;
		font-size: 24px;
		width: 100%;
		padding: 24px;
		text-align: center;
		background: black;
		flex: 0 0;
	}

	#splash-dismiss {
		cursor: pointer;
		background: black;
		font-size: 24px;
		border: 1px solid white;
		padding: 8px;

		flex: 0 0;
	}

	.dismiss-container {
		background: black;
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		padding: 8px;
		flex: 0 0;
	}

	#splash-top-spacer,
	#splash-bottom-spacer {
		background: black;
		width: 100%;
		flex: 1 1;

	}
</style>

<script>
	export let dismiss = () => {};
</script>

<div id="splash-screen">
	<div id="splash-top-spacer" />
	<div id="splash-logo">
		HYPERBREEDER
	</div>
	<div id="splash-description">
		A Nuclear Idle Game
	</div>
	<div class="dismiss-container">
		<div id="splash-dismiss" on:click={dismiss}>
			Start
		</div>
	</div>
<div id="splash-bottom-spacer" />
</div>
