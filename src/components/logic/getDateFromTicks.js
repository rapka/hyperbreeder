import addHours from 'date-fns/addHours';

const getDate = (ticks) => {
	const startDate = new Date(2030, 1, 1);

	return addHours(startDate, ticks * 12);
};

export default getDate;