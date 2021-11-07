<style>
	@import '../vars';

	.y-axis {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		color: white;
		font-size: 14px;
		padding: 4px;
		z-index: 10;
	}

	.echo {
		position: absolute;
		color: $togoPink;
		background: transparent;
		/*z-index: -1;*/
		opacity: 0.5;
		height: 100%;
		/*padding: 5px;*/
		padding: 0;
	}
</style>

<script>
	import { currentStore } from '../stores';
</script>

<div class="y-axis">
	<div class="y-axis echo">
	  <div class="y-axis-number">{$currentStore.gameStatus.maxNeutrons}</div>
	  <div class="y-axis-number">{$currentStore.gameStatus.maxNeutrons * 0.75}</div>
	  <div class="y-axis-number">{$currentStore.gameStatus.maxNeutrons * 0.5}</div>
	  <div class="y-axis-number">{$currentStore.gameStatus.maxNeutrons * 0.25}</div>
	  <div class="y-axis-number">0</div>
	</div>
  <div class="y-axis-number">{$currentStore.gameStatus.maxNeutrons}</div>
  <div class="y-axis-number">{$currentStore.gameStatus.maxNeutrons * 0.75}</div>
  <div class="y-axis-number">{$currentStore.gameStatus.maxNeutrons * 0.5}</div>
  <div class="y-axis-number">{$currentStore.gameStatus.maxNeutrons * 0.25}</div>
  <div class="y-axis-number">0</div>
</div>
