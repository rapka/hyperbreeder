// https://www-nds.iaea.org/sgnucdat/a6.htm
const neutronsPerFission = {
	'Th232': {
		type: 'fast',
		total: 2.456,
		delayed: 0.0499,
	},

	'U233': {
		type: 'thermal',
		total: 2.4968,
		delayed: 0.0067,
		fissionProbability: 0.92,
	},
	'U235': {
		type: 'thermal',
		total: 2.4355,
		delayed: 0.0162,
		fissionProbability: 0.855,
	},
	'U238': {
		type: 'fast',
		total: 2.819,
		delayed: 0.0465,
	},
	'Pu238': {
		type: 'fast',
		total: 3,
		delayed: 0.0047,
	},
	'Pu239': {
		type: 'thermal',
		total: 2.8836,
		delayed: 0.0065,
		fissionProbability: 0.735,
	},
	'Pu240': {
		type: 'fast',
		total: 3.086,
		delayed: 0.0090,
	},
	'Pu241': {
		type: 'thermal',
		total: 2.9479,
		delayed: 0.0160,
		fissionProbability: 0.737,
	},
	'Pu242': {
		type: 'fast',
		total: 2.189,
		delayed: 0.0183,
	},

	'Am241': {
		type: 'thermal',
		total: 2.239,
		delayed: 0.0043,
	},

	'Cm242': {
		type: 'spontaneous',
		total: 2.529,
		delayed: 0.0013,
	},
	'Cm243': {
		type: 'thermal',
		total: 3.433,
		delayed: 0.0030,
	},
	'Cm244': {
		type: 'spontaneous',
		total: 2.691,
		delayed: 0.0033,
	},
	'Cm245': {
		type: 'thermal',
		total: 3.6,
		delayed: 0.0064,
	},

	'Cf252': {
		type: 'spontaneous',
		total: 3.7692,
		delayed: 0.0086,
	},
};

export default neutronsPerFission;