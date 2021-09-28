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
	import { resources } from '../stores';

	const MAX_HEIGHT = 400;
	const X_INTERVAL = 20;
</script>

<section class="display-panel">
  <div class="panel-label">Counter: <span class="panel-value">{$resources.powerLevel}</span></div>
  <div class="panel-label">Energy: <span class="panel-value">{$resources.energy}</span></div>
</section>
