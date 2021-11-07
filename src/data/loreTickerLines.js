import getDateFromTicks from '../components/logic/getDateFromTicks';
import getYear from 'date-fns/getYear';

const loreLines = [
	{
		id: 0,
		text: 'World\'s first experimental "hyper" breeder typer nuclear reactor to be activated for the first time.',
		isValid: save => getYear(getDateFromTicks(save.tickCount)) === 2030,
	},
	{
		id: 1,
		text: 'Nuclear meltdown leads to shutdown of hyperbreeder reactor.',
		isValid: save => save.tickCount < 0,
	},
	{
		id: 2,
		text: 'The hyperbreeder reactor celebrates 2040 as its tenth anniversary!',
		isValid: save => getYear(getDateFromTicks(save.tickCount)) === 2040,
	},
];

export default loreLines;