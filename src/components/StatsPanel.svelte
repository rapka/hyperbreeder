<style>
	@import '../vars';

	.statsPanel {
		font-family: 'xanh';
		text-transform: uppercase;
		background: linear-gradient(80deg, $togoRed, $togoYellow, $togoGreen);
		padding: 4px;
		border-radius: 8px;
		min-width: 300px;
	}

</style>

<script>
	import { gameStatus, controlRods } from '../stores';

	console.log('wut', gameStatus);
	console.log('wut', $gameStatus);
</script>

<section class="statsPanel">
	<div>Resonance Escape Probability: {$gameStatus.p}</div>
	<div>Reproduction factor: {$gameStatus.n}</div>
	<div>Fast Fission Factor: {$gameStatus.e}</div>
	<div>Thermal Utilization Factor: {$gameStatus.f}</div>
	<div>Fast Non-leakage Probability: {$gameStatus.pf}</div>
	<div>Thermal Non-leakage Probability: {$gameStatus.pt}</div>
</section>

