<style>
	@import '../vars';

	.neutron-counter {
		display: inline-block;
	}

	.counter-label {
		font-size: 18px;
		margin-left: -8px;
	}

	.counter-container {
		display: inline-block;
		line-height: 18px;
	}

	.counter-value {
	}

	.counter-value-danger {
		color: red;
	}

	.counter-denominator {
		font-size: 12px;
		margin-left: -5px;
	}

	.waste-container {
		margin-left: 4px;
	}
</style>

<script>
	import classNames from 'classnames';
	import { resources, poisonAmount, gameStatus } from '../stores';

	let energyClasses, powerClasses, poisonClasses, poisonValue;


	$: {
		powerClasses = classNames('counter-value', {
			'counter-value-danger': ($resources.powerLevel / $gameStatus.maxNeutrons) >= .9,
		});

		energyClasses = classNames('counter-value', {
			'counter-value-danger': ($resources.energy / $gameStatus.maxEnergy) >= .9,
		});

		poisonValue = $poisonAmount / Math.max($resources.powerLevel, 1);
		poisonClasses = classNames('counter-value', {
			'counter-value-danger': poisonValue >= 90,
		});
	}
</script>

<div class="neutron-counter">
  <div class="counter-container">
  	<span class="counter-label">Power Lvl: </span>
  	<span class={powerClasses}>{$resources.powerLevel}</span>
  	<span class="counter-denominator">/{$gameStatus.maxNeutrons}</span>
  </div>
  <div class="counter-container">
  	<span class="counter-label">Energy: </span>
  	<span class={energyClasses}>{$resources.energy}</span>
  	<span class="counter-denominator">/{$gameStatus.maxEnergy}</span>
  </div>
  <div class="counter-container">
  	<span class="counter-label">Poison: </span>
  	<span class={poisonClasses}>{poisonValue.toFixed(2)}%</span>
  </div>
  <div class="counter-container waste-container">
  	<span class="counter-label">Waste: </span>
  	<span class="counter-value">{parseInt($resources.waste)}</span>
  </div>
</div>
