<svelte:head>
  <link rel="preload" href="./MajorMonoDisplay-Regular.ttf" as="font"
      type="font/ttf" crossorigin="anonymous">
  <link rel="preload" href="./XanhMono-Regular.ttf" as="font"
      type="font/ttf" crossorigin="anonymous">
</svelte:head>
<style>
	@import 'vars';

	:global(html) {
		font-family: 'xanh';
		letter-spacing: 1px;
	}

	:global(body) {
		margin: 0 !important;
	}

	#main-container {
		font-family: 'majormono';
		background: linear-gradient(80deg, $togoRed, $togoYellow, $togoGreen);
		display: flex;
		flex-direction: row;
	}
</style>

<script>
	import Game from './components/Game.svelte';
	import SplashScreen from './splash/SplashScreen.svelte';

	let splashShown = true;

	const dismissSplash = () => {
		splashShown = false;
	};
</script>

<div id="main-container">
	{#if splashShown}
		<SplashScreen dismiss={dismissSplash} />
	{:else}
		<Game />
	{/if}
</div>
