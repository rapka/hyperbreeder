import { writable } from 'svelte/store';

const popupStatus = writable({
	callback: () => {},
	text: 'TESSST',
	dismissText: 'DIS',
});

export default popupStatus;
