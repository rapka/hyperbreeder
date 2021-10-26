<style>
	@import '../vars';

	.date-display {
		line-height: 20px;
		font-size: 20px;
		box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.8);
		display: inline-block;
		background: rgba(255, 255, 255, 0.7);
		padding: 8px 4px;
		border: 1px solid white;
		width: 100%;
	}

	.date-year {
		display: inline-block;
	}

	.date-month {
	}
</style>

<script>
	import { gameStatus } from '../stores/matterStores';
	import getDateFromTicks from './logic/getDateFromTicks';
	import getYear from 'date-fns/getYear';
	import format from 'date-fns/format';

	let currentDate;

	$: {
		currentDate = getDateFromTicks($gameStatus.tickCount);
	}
</script>

<div class="date-display">
  <span class="panel-label">
  	Date:
  </span>
  <span class="date-year">
		{getYear(currentDate)}
	</span>
	<span class="date-month">
		{format(currentDate, 'MMM')}
	</span>
</div>
