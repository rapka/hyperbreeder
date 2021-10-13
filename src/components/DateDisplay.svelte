<style>
	@import '../vars';

	.date-display {
		padding-left: 16px;
		line-height: 18px;
		font-size: 18px;
	}

	.date-year {
		display: inline-block;
	}

	.date-month {
		color: red;
	}
</style>

<script>
	import getYear from 'date-fns/getYear';
	import addHours from 'date-fns/addHours';
	import format from 'date-fns/format';
	import { gameStatus } from '../stores';

	const startDate = new Date(2050, 1, 1);
	let currentDate;

	$: {
		currentDate = addHours(startDate, $gameStatus.tickCount * 12)
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
