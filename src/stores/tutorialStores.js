import { writable } from 'svelte/store';

// Flags for tutorial popups. true = popup has been shown
const tutorialStatus = writable({
	intro: false,
	meltdown: false,
});

export default tutorialStatus;