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
	import { p, n, e, f, pf, pt, controlRods } from '../stores';
</script>

<section class="panel panel-2">
	<p>Resonance Escape Probability: {$p}</p>
	<p>Reproduction factor: {$n}</p>
	<p>Fast Fission Factor: {$e}</p>
	<p>Thermal Utilization Factor: {$f}</p>
	<p>Fast Non-leakage Probability: {$pf}</p>
	<p>Thermal Non-leakage Probability: {$pt}</p>
</section>

