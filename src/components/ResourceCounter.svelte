<style>
	@import '../vars';

	.neutron-counter {
		display: inline-block;
		background: rgba(255, 255, 255, 0.7);
		padding: 8px 0 8px 4px;
		border: 1px solid white;
		margin: 8px 0;
		box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.8);
	}

	.counter-label {
		font-size: 18px;
	}

	.counter-container {
		line-height: 18px;
		margin: 2px 0;
	}

	.counter-value {
	}

	.counter-value-danger {
		color: red;
	}

	.counter-denominator {
		font-size: 12px;
		margin-left: -12px;
	}

	.waste-container {
		margin-left: 4px;
	}
</style>

<script>
	import classNames from 'classnames';
	import { currentStore } from '../stores';

	let resources, gameStatus, poisonAmount;
	let energyClasses, powerClasses, poisonClasses, poisonValue;

	$: {
		resources = $currentStore.resources;
		gameStatus = $currentStore.gameStatus;
		poisonAmount = $currentStore.poisonAmount;

		powerClasses = classNames('counter-value', {
			'counter-value-danger': (resources.powerLevel / gameStatus.maxNeutrons) >= .9,
		});

		energyClasses = classNames('counter-value', {
			'counter-value-danger': (resources.energy / gameStatus.maxEnergy) >= .9,
		});

		poisonValue = poisonAmount / Math.max(resources.powerLevel, 1);
		poisonClasses = classNames('counter-value', {
			'counter-value-danger': poisonValue >= 90,
		});
	}
</script>

<div class="neutron-counter">
  <div class="counter-container">
  	<span class="counter-label">Power Lvl: </span>
  	<span class={powerClasses}>{resources.powerLevel}</span>
  	<span class="counter-denominator">/{gameStatus.maxNeutrons}</span>
  </div>
  <div class="counter-container">
  	<span class="counter-label">Energy: </span>
  	<span class={energyClasses}>{resources.energy}</span>
  	<span class="counter-denominator">/{gameStatus.maxEnergy}</span>
  </div>
  <div class="counter-container">
  	<span class="counter-label">Poison: </span>
  	<span class={poisonClasses}>{poisonValue.toFixed(2)}%</span>
  </div>
  <div class="counter-container waste-container">
  	<span class="counter-label">Waste: </span>
  	<span class="counter-value">{parseInt(resources.waste)}</span>
  </div>
</div>
