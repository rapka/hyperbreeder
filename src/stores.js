import cloneDeep from 'lodash/cloneDeep';
import { writable, derived } from 'svelte/store';
import upgrades from './data/upgrades';
import forEach from 'lodash/forEach';

// Player info / random
export const playerName = writable('player');
export const pauseStatus = writable(true);
export const debugMultiplier = writable(1);

// Resource counts
export const resources = writable({
	powerLevel: 0,
	energy: 0,
});

export const counterHistory = writable([0]);

export const controlRods = writable([false, true]);

const DEFAULT_VALUES = {
	e: 1.03, // Fast Fission Factor https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/fast-fission-factor/
	n: 2.02, // Reproduction factor https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/reproduction-factor/
	f: 0.7, // Thermal Utilization Factor https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/thermal-utilization-factor/
	p: 0.75, // Resonance Escape Probability https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/resonance-escape-probability/
	pt: 0.96,
	pf: 0.95,
	tickCount: 0,
	maxNeutrons: 2000,
	maxEnergy: 10000,
};

export let saveGame = writable(DEFAULT_VALUES);

// Six factor formula vars
export let e = writable(1.03);
export let n = writable(2.02);
export let f = writable(0.7);
export let p = writable(0.75);

export const pt = writable(0.96);
export const pf = writable(0.95);

export const startupTime = writable(20); // Reactor startup time in ticks
export const startupAmount = writable(1000); // Total neutrons to feed during startup
export const startupTimer = writable(0); // Reactor startup time in ticks

export const upgradeStatus = writable(upgrades);

export const gameStatus = derived(
	[upgradeStatus, saveGame],
	([$upgradeStatus, $saveGame]) => {
		let clonedSave = cloneDeep($saveGame);
		forEach($upgradeStatus, upgrade => {
			if (upgrade.purchased) {
				clonedSave = upgrade.apply(clonedSave);
			}
		})

		return clonedSave;
	},
);


export const kInf = derived([gameStatus], ([$gameStatus]) =>
	$gameStatus.pf * $gameStatus.pt * $gameStatus.e * $gameStatus.n * $gameStatus.f * $gameStatus.p);
export const kEff = derived([gameStatus], ([$gameStatus]) => $gameStatus.pf * $gameStatus.pt);
