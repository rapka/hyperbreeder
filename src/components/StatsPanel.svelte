<style>
	@import '../vars';

	.statsPanel {
		font-family: 'xanh';
		text-transform: uppercase;
		background: rgba(255, 255, 255, 0.7);
		padding: 4px;
		border: 1px solid $togoPink;
		min-width: 300px;
		/*color: white;*/
	}
</style>

<script>
	import { gameStatus, controlRods } from '../stores';
</script>

<section class="statsPanel">
	<div>Resonance Escape Probability: {$gameStatus.p}</div>
	<div>Reproduction factor: {$gameStatus.n}</div>
	<div>Fast Fission Factor: {$gameStatus.e}</div>
	<div>Thermal Utilization Factor: {$gameStatus.f}</div>
	<div>Fast Non-leakage Probability: {$gameStatus.pf}</div>
	<div>Thermal Non-leakage Probability: {$gameStatus.pt}</div>
</section>

