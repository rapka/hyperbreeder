<svelte:head>
  <!-- Google Font -->
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" href="../public/MajorMonoDisplay-Regular.ttf" as="font"
      type="font/ttf" crossorigin="anonymous">
</svelte:head>
<style>
	@import '../vars';

	:global(html) {
		font-family: 'majormono';
	}

	p {
		font-family: 'majormono';
		color: white;
		background: black;
		font-size: 2em;
	}

	.panel-1 {
		font-family: 'majormono';
		background: linear-gradient(80deg, $togoRed, $togoYellow, $togoGreen);
	}

</style>

<script>
	import Loop from './logic/Loop.svelte';
	import PauseButton from './PauseButton.svelte';
	import { mainCounter, p, n, e, f, pf, pt, controlRods } from '../stores';

	let name = 'world';
</script>

<Loop />
<PauseButton />

<section class="panel panel-1">
	<h1>Hello {name}!</h1>
	<p>Counter: {$mainCounter}</p>
</section>

<section class="panel panel-2">
	<p>Control Rods</p>
	<p>Reproduction factor: {$controlRods}</p>
</section>