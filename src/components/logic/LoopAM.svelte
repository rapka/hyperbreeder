<script>
	import set from 'lodash/set';
	import {
		resources,
		gameStatus,
		counterHistory,
		saveGame,
		poisonAmount,
	} from '../../stores/antimatterStores';
	import rbinom from './rbinom';

	const MAX_HISTORY = 30;

	const LN_2 = 0.693;

	const loop = () => {
		setTimeout(loop, 250);

		const simulateFastFission = (neutrons) => {
			return neutrons * $gameStatus.e;
		};

		const simulateFastLeakage = (neutrons) => {
			return rbinom(neutrons, $gameStatus.pf);
		};

		const simulateResonanceEscape = (neutrons) => {
			return rbinom(neutrons, $gameStatus.p);
		};

		const simulateThermalLeakage = (neutrons) => {
			return rbinom(neutrons, $gameStatus.pt);
		};

		const simulateThermalUtilization = (neutrons) => {
			return rbinom(neutrons, $gameStatus.f);
		};

		const simulateReproduction = (neutrons) => {
			return neutrons * $gameStatus.n;
		};

		const simulatePoison = (neutrons) => {
			return Math.max(neutrons - $poisonAmount, 0);
		};

		resources.update(resourcesObj => {
			let neutrons = resourcesObj.powerLevel;

			if ($gameStatus.pauseStatus) {
				return resourcesObj;
			}

			$saveGame.startupTimer += 1;

			saveGame.update(o => set(o, 'tickCount', o.tickCount + 1));

			resourcesObj.iodine.unshift(neutrons * .064);

			const fissioned = simulateFastFission(neutrons);
			neutrons = fissioned;
			neutrons = simulateFastLeakage(neutrons);
			neutrons = simulateResonanceEscape(neutrons);
			neutrons = simulateThermalLeakage(neutrons);
			neutrons = simulatePoison(neutrons);

			const utilized = simulateThermalUtilization(neutrons);

			resourcesObj.energy += utilized;
			resourcesObj.energy = Math.min(resourcesObj.energy, $gameStatus.maxEnergy);
			resourcesObj.waste += fissioned * .0001;

			resourcesObj.xenon.unshift(0);

			// Nuclear decay
			const lambda = LN_2 / gameStatus.wasteHalfLife;
			resourcesObj.waste = resourcesObj.waste * Math.exp(lambda * -1);

			// Simulate iodine -> decay chain
			resourcesObj.iodine = resourcesObj.iodine.map((poisonTick, index) => {
				const newTick = poisonTick * Math.exp((LN_2 / $gameStatus.xenonHalfLife) * -1 * index);
				resourcesObj.xenon[index] = poisonTick - newTick;
				return newTick;
			});

			resourcesObj.xenon = resourcesObj.xenon.map((xenonTick, index) => {
				const newTick = xenonTick * Math.exp((LN_2 / $gameStatus.xenonHalfLife) * -1 * index);
				return newTick;
			});

			// Optimize poison history
			while (resourcesObj.xenon[resourcesObj.xenon.length - 1] <= 0.00001 && resourcesObj.xenon.length > 1) {
				resourcesObj.iodine.pop();
				resourcesObj.xenon.pop();
			}

			neutrons = utilized;
			neutrons = parseInt(simulateReproduction(neutrons));

			// MELTDOWN
			if (neutrons > $gameStatus.maxNeutrons) {
				$saveGame.controlRods = Array($saveGame.controlRods.length).fill(true);
				$saveGame.startupTimer = parseInt(0 - $gameStatus.meltdownCooldown * (neutrons / $gameStatus.maxNeutrons));

				resourcesObj.energy = parseInt(resourcesObj.energy / 2);
				resourcesObj.powerLevel = 0;
				neutrons = 0;
			} else {
				resourcesObj.powerLevel = neutrons;
			}

			counterHistory.update(history => {
				history.push(neutrons);

				if (history.length === MAX_HISTORY) {
					history = history.splice(1, MAX_HISTORY + 1);
				}

				return history;
			});

			return resourcesObj;
		});
	}

	loop();
</script>
