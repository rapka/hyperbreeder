import { writable } from 'svelte/store';

// Flags for tutorial popups. true = popup has been shown
const options = writable({
	intro: false,
	meltdown: false,
});

export default options;