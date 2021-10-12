<style>
	@import '../vars';

	.faqTab {
		font-family: 'xanh';
		background: rgba(0, 0, 0, 0.75);
		padding: 16px;
		min-width: 300px;
		color: white;
	}
</style>

<script>
	import { upgradeStatus, resources } from '../stores';
</script>

<section class="faqTab">
	Hyperbreeder is an idle game about generating power.

	Clicking the big green "start reactor" button will begin generating energyover time. Energy can be used for upgrades and is additionally used for the initial reactor startup. If the power level reaches maximum, the reactor will automatically shut down and you will have to wait to start up again.

	Running the reactor generates poison over time, which reduces efficiency. This can be counteracted by adjusting the control rods at the bottom of the screen: each rod in the down position decreases reactor power.

	The Reactor also generates waste, which is currently unused.
</section>

