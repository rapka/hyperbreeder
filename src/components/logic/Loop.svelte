
<script>
	import {
		resources,
		gameStatus,
		counterHistory,
		pauseStatus,
		startupTime, startupAmount, startupTimer,
	} from '../../stores';
	import times from 'lodash/times';
	import set from 'lodash/set';
	import rbinom from './rbinom';

	let name = 'world';
	const MAX_HISTORY = 30;

	const loop = () => {
		setTimeout(loop, 500);

		// n = 2.04;
		// f = 0.75;

		const simulateFastFission = (neutrons, factor) => {
			return neutrons * $gameStatus.e;
		};

		const simulateFastLeakage = (neutrons) => {
			return rbinom(neutrons, $gameStatus.pf);
		};

		const simulateResonanceEscape = (neutrons, factor) => {
			return rbinom(neutrons, $gameStatus.p);
		};

		const simulateThermalLeakage = (neutrons, factor) => {
			return rbinom(neutrons, $gameStatus.pt);
		};

		const simulateThermalUtilization = (neutrons, factor) => {
			return rbinom(neutrons, $gameStatus.f);
		};

		const simulateReproduction = (neutrons, factor) => {
			return neutrons * $gameStatus.n;
		};

		resources.update(resourcesObj => {
			let neutrons = resourcesObj.powerLevel;

			if ($pauseStatus) {
				return resourcesObj;
			} else if ($startupTimer < $startupTime) {
				neutrons += $startupAmount / $startupTime;
				startupTimer.update(timer => timer + 1);
			}

			neutrons = simulateFastFission(neutrons);
			neutrons = simulateFastLeakage(neutrons);
			neutrons = simulateResonanceEscape(neutrons);
			neutrons = simulateThermalLeakage(neutrons);

			const utilized = simulateThermalUtilization(neutrons);

			resources.update(o => set(o, 'energy', o.energy + (neutrons - utilized)));

			neutrons = utilized;
			neutrons = parseInt(simulateReproduction(neutrons));

			counterHistory.update(history => {
				history.push(neutrons);

				if (history.length === MAX_HISTORY) {
					history = history.splice(1, MAX_HISTORY + 1);
				};

				return history;
			});

			resourcesObj.powerLevel = neutrons;
			return resourcesObj;
		});
	}

	loop();
</script>
