<style>
	@import '../vars';

	.activity-display {
		line-height: 20px;
		box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.8);
		background: rgba(255, 255, 255, 0.7);
		padding: 8px 4px;
		border: 1px solid white;
		margin-top: 8px;
	}

	.log-item-container {
		height: 85px;
		overflow-y: scroll;
		background: rgba(0, 0, 0, 0.75);
		color: white;
	}

	.log-item {
		font-family: 'xanh';
		font-size: 14px;
	}

	.log-header {
		font-size: 16px;
	}

</style>

<script>
	import activityLog from '../stores/activityLog';
</script>

<div class="activity-display">
	<div class="log-header">Activity Log</div>
	<div class="log-item-container">
		{#each $activityLog as log}
			<div class="log-item">{log}</div>
		{/each}
	</div>
</div>
