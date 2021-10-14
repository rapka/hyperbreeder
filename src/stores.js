import { writable, derived } from 'svelte/store';
import cloneDeep from 'lodash/cloneDeep';
import upgrades from './data/upgrades';
import forEach from 'lodash/forEach';
import filter from 'lodash/filter';
import sum from 'lodash/sum';
import find from 'lodash/find';
import loreTickerLines from './data/loreTickerLines';


// Player info / random
export const playerName = writable('player');
export const pauseStatus = writable(false);
export const debugMultiplier = writable(1);

// Resource counts
export const resources = writable({
	powerLevel: 0,
	energy: 1000,
	iodine: [],
	xenon: [],
	waste: 0,
});

export const counterHistory = writable([0]);

const DEFAULT_VALUES = {
	// Six factor formula vars
	e: 1.03, // Fast Fission Factor https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/fast-fission-factor/
	n: 2.02, // Reproduction factor https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/reproduction-factor/
	f: 0.7 + 0.07, // Thermal Utilization Factor https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/thermal-utilization-factor/
	p: 0.75, // Resonance Escape Probability https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/resonance-escape-probability/
	pt: 0.96, // thermal non leakage
	pf: 0.95, // fast nonleakage
	tickCount: 0,
	maxNeutrons: 2000,
	maxEnergy: 10000,
	wasteHalfLife: 1000,
	xenonHalfLife: 8,
	iodineHalfLife: 5,
	meltdownCooldown: 20,
	controlRods: [false, false, false, false, false, false, false, true, true, true],
};

export let saveGame = writable(DEFAULT_VALUES);

export const pt = writable(0.96);
export const pf = writable(0.95);

export const startupTime = writable(20); // Reactor startup time in ticks
export const startupAmount = writable(1000); // Total neutrons to feed during startup
export const startupTimer = writable(0); // Reactor startup time in ticks

export const upgradeStatus = writable(upgrades);
export const unlockedUpgrades = derived([upgradeStatus], ([$upgrades]) => filter($upgrades, upgrade => {
	for (const id of upgrade.requirements) {
		if (!find($upgrades, { id }).purchased) {
			return false;
		}
	}

	return true;
}).map(unlock => unlock.id));

const CONTROL_ROD_POWER = 0.005;

export const gameStatus = derived(
	[upgradeStatus, saveGame, resources],
	([$upgradeStatus, $saveGame, $resources]) => {
		let clonedSave = cloneDeep($saveGame);
		forEach($upgradeStatus, upgrade => {
			if (upgrade.purchased) {
				clonedSave = upgrade.apply(clonedSave);
			}
		});

		forEach($saveGame.controlRods, rod => {
			if (rod) {
				clonedSave.f = clonedSave.f - CONTROL_ROD_POWER;
			}
		});

		// clonedSave.f -= $resources.poison;

		return clonedSave;
	},
);

export const kInf = derived([gameStatus], ([$gameStatus]) =>
	$gameStatus.pf * $gameStatus.pt * $gameStatus.e * $gameStatus.n * $gameStatus.f * $gameStatus.p);
export const kEff = derived([gameStatus], ([$gameStatus]) => $gameStatus.pf * $gameStatus.pt);

// export const poisonAmount = derived([resources], ([$resources]) => sum($resources.xenon) * 1 - (1 / ($resources.powerLevel || 1)));
export const poisonAmount = derived([resources], ([$resources]) => sum($resources.xenon));
