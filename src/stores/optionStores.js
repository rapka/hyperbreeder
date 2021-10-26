import { writable } from 'svelte/store';

// Player info / random
export const debugMultiplier = writable(1);

// Resource counts
const options = writable({
	darkMode: false,
});

export default options;