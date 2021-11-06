import { writable, derived } from 'svelte/store';
import popupStrings from '../data/popupStrings.json';

export const popupStatus = writable('intro');

export const popupText = derived([popupStatus], ([$popupStatus]) => {
	if ($popupStatus) {
		return popupStrings[$popupStatus];
	} else {
		return {};
	}
});
