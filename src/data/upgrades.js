const upgrades = [
	{
		id: 0,
		title: 'Extra Control Rod I',
		description: 'Grants another control rod. Permanently deceases reactor power in exchange for increased control.',
		lore: 'Asumming control',
		requirements: [],
		cost: {
			energy: 100000,
		},
		apply: save => {
			save.controlRods.push(true);
			save.n -= .01;
			return save;
		},
	},
	{
		id: 1,
		title: 'Extra Control Rod II',
		description: 'Grants another control rod. Permanently deceases reactor power in exchange for increased control.',
		lore: 'Asumming control',
		requirements: [0],
		cost: {
			energy: 1000000,
		},
		apply: save => {
			save.controlRods.push(true);
			save.n -= .01;
			return save;
		},
	},
	{
		id: 2,
		title: 'Extra Control Rod III',
		description: 'Grants another control rod. Permanently deceases reactor power in exchange for increased control.',
		lore: 'Asumming control',
		requirements: [1],
		cost: {
			energy: 10000000,
		},
		apply: save => {
			save.controlRods.push(true);
			save.n -= .01;
			return save;
		},
	},
	{
		id: 3,
		title: 'Extra Control Rod IV',
		description: 'Grants another control rod. Permanently deceases reactor power in exchange for increased control.',
		lore: 'Asumming control',
		requirements: [2],
		cost: {
			energy: 100000000,
		},
		apply: save => {
			save.controlRods.push(true);
			save.n -= .01;
			return save;
		},
	},
	{
		id: 4,
		title: 'Extra Control Rod V',
		description: 'Grants another control rod. Permanently deceases reactor power in exchange for increased control.',
		lore: 'Asumming control',
		requirements: [3],
		cost: {
			energy: 1000000000,
		},
		apply: save => {
			save.controlRods.push(true);
			save.n -= .01;
			return save;
		},
	},
	{
		id: 5,
		title: 'Increase Power Cap I',
		description: '+1000 maximum power level',
		lore: 'It goes up to 11!',
		requirements: [],
		apply: save => {
			save.pf += .01;
			return save;
		},
		cost: {
			energy: 10000,
		},
	},
	{
		id: 6,
		title: 'Increase Power Cap II',
		description: '+1000 maximum power level',
		lore: 'It goes up to 11!',
		requirements: [5],
		apply: save => {
			save.maxNeutrons += 1000;
			return save;
		},
		cost: {
			energy: 25000,
		},
	},
	{
		id: 7,
		title: 'Increase Power Cap III',
		description: '+1000 maximum power level',
		lore: 'It goes up to 11!',
		requirements: [6],
		apply: save => {
			save.maxNeutrons += 1000;
			return save;
		},
		cost: {
			energy: 50000,
		},
	},
	{
		id: 8,
		title: 'Increase Power Cap IV',
		description: '+1000 maximum power level',
		lore: 'It goes up to 11!',
		requirements: [7],
		apply: save => {
			save.maxNeutrons += 1000;
			return save;
		},
		cost: {
			energy: 100000,
		},
	},
	{
		id: 9,
		title: 'Increase Power Cap V',
		description: '+1000 maximum power level',
		lore: 'It goes up to 11!',
		requirements: [8],
		apply: save => {
			save.maxNeutrons += 1000;
			return save;
		},
		cost: {
			energy: 500000,
		},
	},
	{
		id: 10,
		title: 'Expanded Batteries I',
		description: '+10K maximum energy storage',
		lore: 'Keep going and going',
		requirements: [],
		apply: save => {
			save.maxEnergy += 10000;
			return save;
		},
		cost: {
			energy: 5000,
		},
	},
	{
		id: 11,
		title: 'Expanded Batteries II',
		description: '+10K maximum energy storage',
		lore: 'Keep going and going',
		requirements: [10],
		apply: save => {
			save.maxEnergy += 10000;
			return save;
		},
		cost: {
			energy: 10000,
		},
	},
	{
		id: 12,
		title: 'Expanded Batteries III',
		description: '+10K maximum energy storage',
		lore: 'Keep going and going',
		requirements: [11],
		apply: save => {
			save.maxEnergy += 10000;
			return save;
		},
		cost: {
			energy: 15000,
		},
	},
	{
		id: 13,
		title: 'Expanded Batteries IV',
		description: '+10K maximum energy storage',
		lore: 'Keep going and going',
		requirements: [12],
		apply: save => {
			save.maxEnergy += 10000;
			return save;
		},
		cost: {
			energy: 20000,
		},
	},
	{
		id: 14,
		title: 'Expanded Batteries V',
		description: '+10K maximum energy storage',
		lore: 'Keep going and going',
		requirements: [13],
		apply: save => {
			save.maxEnergy += 10000;
			return save;
		},
		cost: {
			energy: 25000,
		},
	},
];

export default upgrades;