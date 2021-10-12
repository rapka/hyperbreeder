const upgrades = [
	{
		id: 0,
		title: 'test',
		description: 'pf += 0.01',
		lore: 'test lore',
		requirements: [],
		cost: {
			energy: 10000,
		},
		apply: save => {
			save.pf += .01;
			return save;
		},
	},
	{
		id: 1,
		title: 'test title2',
		description: '+1 control rod',
		lore: 'test lore2',
		requirements: [],
		apply: save => {
			save.pf += .01;
			return save;
		},
		cost: {
			energy: 200,
		},
	},
	{
		id: 2,
		title: 'test title23',
		description: 'test desc23',
		lore: 'test lore3',
		requirements: [],
		cost: {},
		apply: save => save,
	}
];

export default upgrades;