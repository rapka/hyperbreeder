<style>
	@import '../vars';

	.neutron-counter {
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
		color: $togoRed;
	}

	.counter-value-warning {
		color: $togoYellow;
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
	import FormattedNumber from './ui/FormattedNumber.svelte';

	let resources, gameStatus, poisonAmount;
	let energyClasses, powerClasses, poisonClasses, poisonPercent;

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

		console.log('poisonAmount', poisonAmount);

		poisonPercent = resources.powerLevel > 0 ? (poisonAmount / resources.powerLevel) : (poisonAmount / gameStatus.startupAmount);
		poisonClasses = classNames('counter-value', {
			'counter-value-warning': poisonPercent >= 80 && poisonPercent < 100,
			'counter-value-warning': poisonPercent >= 100,
		});
	}
</script>

<div class="neutron-counter">
  <div class="counter-container">
  	<span class="counter-label">Power Lvl: </span>
  	<span class={powerClasses}><FormattedNumber value={resources.powerLevel} /></span>
  	<span class="counter-denominator">/<FormattedNumber value={gameStatus.maxNeutrons} /></span>
  </div>
  <div class="counter-container">
  	<span class="counter-label">Energy: </span>
  	<span class={energyClasses}><FormattedNumber value={resources.energy} /></span>
  	<span class="counter-denominator">/<FormattedNumber value={gameStatus.maxEnergy} /></span>
  </div>
  <div class="counter-container">
  	<span class="counter-label">Poison: </span>
  	<span class={poisonClasses}>{(poisonPercent * 100).toFixed(2)}%</span>
  </div>
  <div class="counter-container waste-container">
  	<span class="counter-label">Waste: </span>
  	<span class="counter-value"><FormattedNumber value={resources.waste} /></span>
  </div>
</div>
