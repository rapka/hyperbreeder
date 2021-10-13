<style>
	@import '../vars';

	.neutron-counter {
		display: inline-block;
	}

	.counter-label {
		font-size: 18px;
	}

	.counter-container {
		display: inline-block;
	}

	.counter-value {
		color: red;
	}

	.counter-denominator {
		font-size: 12px;
	}
</style>

<script>
	import { resources, poisonAmount, gameStatus } from '../stores';

	const MAX_HEIGHT = 400;
	const X_INTERVAL = 20;
</script>

<div class="neutron-counter">
  <span class="counter-container">
  	<span class="counter-label">Power Lvl: </span>
  	<span class="panel-value">{$resources.powerLevel}</span>
  	<span class="counter-denominator">/{$gameStatus.maxNeutrons}</span>
  </span>
  <span class="counter-container">
  	<span class="counter-label">Energy: </span>
  	<span class="panel-value">{$resources.energy}</span>
  	<span class="counter-denominator">/{$gameStatus.maxEnergy}</span>
  </span>
  <span class="counter-container">
  	<span class="counter-label">Poison: </span>
  	<span class="counter-value">{($poisonAmount / Math.max($resources.powerLevel, 1)).toFixed(2)}</span>
  </span>
  <span class="counter-container">
  	<span class="counter-label">Waste: </span>
  	<span class="counter-value">{parseInt($resources.waste)}</span>
  </span>
</div>
