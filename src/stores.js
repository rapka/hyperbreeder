import { writable, derived } from 'svelte/store';

export const playerName = writable('player');
export const pauseStatus = writable(true);
export const debugMultiplier = writable(1);

export const mainCounter = writable(1000);
export const controlRods = writable([false, true]);

export let e = writable(1.03); // Fast Fission Factor https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/fast-fission-factor/
export let n = writable(2.02); // Reproduction factor https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/reproduction-factor/
export let f = writable(0.7); // Thermal Utilization Factor https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/thermal-utilization-factor/
export let p = writable(0.75); // Resonance Escape Probability https://www.nuclear-power.net/nuclear-power/reactor-physics/nuclear-fission-chain-reaction/resonance-escape-probability/

export const pt = writable(0.96);
export const pf = writable(0.95);


export const greeting = derived(
	name,
	$name => `Hello ${$name}!`
);


const kInf = derived([n, e, p, f], ([$n, $e, $p, $f]) => $n * $e * $p * $f);
const kEff = derived([pf, pt], ([$pf, $pt]) => $pf * $pt);
