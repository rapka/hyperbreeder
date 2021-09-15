
<script>
	import { mainCounter, energyCounter, n, e, f, p, pt, pf, pauseStatus } from '../../stores';
	import times from 'lodash/times';
	import rbinom from './rbinom';

	let name = 'world';

	const loop = () => {
		let n_value, e_value, f_value, p_value, pt_value, pf_value, paused;

		n.subscribe(value => { n_value = value; });
		e.subscribe(value => { e_value = value; });
		f.subscribe(value => { f_value = value; });
		p.subscribe(value => { p_value = value; });
		pt.subscribe(value => { pt_value = value; });
		setTimeout(loop, 500);

		// n = 2.04;
		// f = 0.75;

		const simulateFastFission = (neutrons, factor) => {
			return neutrons * e_value;
		};

		const simulateFastLeakage = (neutrons) => {
			return rbinom(neutrons, $pf);
		};

		const simulateResonanceEscape = (neutrons, factor) => {
			return rbinom(neutrons, p_value);
		};

		const simulateThermalLeakage = (neutrons, factor) => {
			return rbinom(neutrons, pt_value);
		};

		const simulateThermalUtilization = (neutrons, factor) => {
			return rbinom(neutrons, f_value);
		};

		const simulateReproduction = (neutrons, factor) => {
			return neutrons * n_value;
		};

		mainCounter.update(neutrons => {
			if ($pauseStatus) {
				return neutrons;
			}

			neutrons = simulateFastFission(neutrons);
			neutrons = simulateFastLeakage(neutrons);
			neutrons = simulateResonanceEscape(neutrons);
			neutrons = simulateThermalLeakage(neutrons);

			const utilized = simulateThermalUtilization(neutrons);

			energyCounter.update(energy => energy + (neutrons - utilized));

			neutrons = utilized;
			neutrons = simulateReproduction(neutrons);
			return parseInt(neutrons);
		});
	}

	loop();
</script>
