import getDateFromTicks from '../components/logic/getDateFromTicks';
import getYear from 'date-fns/getYear';

export const exportSave = (saveGame, resources) => {
	const saveJson = {
		saveGame,
		resources,
	};

	const base64 = window.btoa(JSON.stringify(saveJson));

	console.log('base64', base64);
	return base64;
};