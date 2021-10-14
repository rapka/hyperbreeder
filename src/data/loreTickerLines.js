import getDateFromTicks from '../components/logic/getDateFromTicks';
import getYear from 'date-fns/getYear';

const loreLines = [
	{
		id: 0,
		text: 'World\'s first experimental "hyper" breeder reactor to be turned on for the first time',
		isValid: save => getYear(getDateFromTicks(save.tickCount)) === 2030,
	},
	{
		id: 1,
		text: 'Always valid lore line',
		isValid: save => true,
	},
	{
		id: 2,
		text: 'Never valid lore line',
		isValid: save => false,
	},
];

export default loreLines;