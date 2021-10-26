const upgrades = [
	{
		id: 0,
		title: 'Extra Control Rod I',
		description: 'Grants another control rod. Permanently deceases reactor power in exchange for increased control.',
		lore: 'Asumming control',
		requirements: [],
		researchRequirements: [],
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
		researchRequirements: [],
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
		researchRequirements: [],
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
		researchRequirements: [],
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
		researchRequirements: [],
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
		researchRequirements: [],
		apply: save => {
			save.maxNeutrons += 1000;
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
		researchRequirements: [],
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
		researchRequirements: [],
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
		researchRequirements: [],
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
		researchRequirements: [],
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
		researchRequirements: [],
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
		researchRequirements: [],
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
		researchRequirements: [],
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
		researchRequirements: [],
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
		researchRequirements: [],
		apply: save => {
			save.maxEnergy += 10000;
			return save;
		},
		cost: {
			energy: 25000,
		},
	},
	{
		id: 15,
		title: 'Moderator Coolant I',
		description: 'Decreases thermal energy leakage during operation',
		lore: 'tbd',
		requirements: [],
		researchRequirements: [],
		apply: save => {
			save.pt += .002;
			return save;
		},
		cost: {
			energy: 30000,
		},
	},
	{
		id: 16,
		title: 'Moderator Coolant II',
		description: 'Decreases thermal energy leakage during operation',
		lore: 'tbd',
		requirements: [15],
		researchRequirements: [],
		apply: save => {
			save.pt += .002;
			return save;
		},
		cost: {
			energy: 32000,
		},
	},
	{
		id: 17,
		title: 'Moderator Coolant III',
		description: 'Decreases thermal energy leakage during operation',
		lore: 'tbd',
		requirements: [16],
		researchRequirements: [],
		apply: save => {
			save.pt += .002;
			return save;
		},
		cost: {
			energy: 34000,
		},
	},
	{
		id: 18,
		title: 'Moderator Coolant IV',
		description: 'Decreases thermal energy leakage during operation',
		lore: 'tbd',
		requirements: [17],
		researchRequirements: [],
		apply: save => {
			save.pt += .002;
			return save;
		},
		cost: {
			energy: 38000,
		},
	},
	{
		id: 19,
		title: 'Moderator Coolant V',
		description: 'Decreases thermal energy leakage during operation',
		lore: 'tbd',
		requirements: [18],
		researchRequirements: [],
		apply: save => {
			save.pt += .002;
			return save;
		},
		cost: {
			energy: 40000,
		},
	},
	{
		id: 20,
		title: 'Tachyonic antitelephone',
		description: 'Decreases thermal energy leakage during operation',
		lore: 'tbd',
		requirements: [],
		researchRequirements: [],
		apply: save => {
			save.pt += .002;
			return save;
		},
		cost: {
			energy: 40000,
		},
	},
	{
		id: 21,
		title: 'Particle collider',
		description: 'Used for researching advanced ',
		lore: 'tbd',
		requirements: [],
		researchRequirements: [],
		apply: save => {
			save.pt += .002;
			return save;
		},
		cost: {
			energy: 40000,
		},
	},
];

export default upgrades;