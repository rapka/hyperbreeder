import getDateFromTicks from '../components/logic/getDateFromTicks';
import getYear from 'date-fns/getYear';

export const encodeSave = (saveGame) => {
	const base64 = window.btoa(JSON.stringify(saveGame));

	return base64;
};

export const decodeSave = (base64) => {
	const saveJson = JSON.parse(window.atob(base64));

	return saveJson;
};