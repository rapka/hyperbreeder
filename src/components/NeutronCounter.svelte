<style>
	@import '../vars';

	.display-panel {

	}

	.panel-label {
		padding: 4px;
		display: inline-block;
	}

	.panel-value {
		color: red;
	}
</style>

<script>
	import { resources, poisonAmount } from '../stores';

	const MAX_HEIGHT = 400;
	const X_INTERVAL = 20;
</script>

<section class="display-panel">
  <div class="panel-label">Power Lvl: <span class="panel-value">{$resources.powerLevel}</span></div>
  <div class="panel-label">Energy: <span class="panel-value">{$resources.energy}</span></div>
  <div class="panel-label">Poison: <span class="panel-value">{($poisonAmount).toFixed(2)}</span></div>
  <div class="panel-label">Waste: <span class="panel-value">{parseInt($resources.waste)}</span></div>
</section>
