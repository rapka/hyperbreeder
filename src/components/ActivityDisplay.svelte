<style>
	@import '../vars';

	.activity-display {
		line-height: 20px;
		box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.7), 0 0 10px rgba(0, 0, 0, 0.4);
		background: rgba(255, 255, 255, 0.7);
		border: 3px solid rgba(255, 255, 255, 0.7);
		margin-top: 8px;
	}

	.activity-display-contents {
		/*box-shadow: 0 0 4px rgba(0, 0, 0, 0.8);*/
	}

	.log-item-container {
		height: 85px;
		overflow-y: scroll;
		background: rgba(0, 0, 0, 0.8);
		/*box-shadow: 0 0 4px rgba(0, 0, 0, 0.6);*/
		color: white;
	}

	.log-item {
		font-family: 'xanh';
		font-size: 14px;
	}

	.log-header {
		background: rgba(255, 255, 255, 0.5);
		font-size: 16px;
	}

</style>

<script>
	import activityLog from '../stores/activityLog';
</script>

<div class="activity-display">
	<div class="activity-display-contents">
	<div class="log-header">Activity Log</div>
		<div class="log-item-container">
			{#each $activityLog as log}
				<div class="log-item">{log}</div>
			{/each}
		</div>
	</div>
</div>
