
const buildingList = [
  {
    name: 'palace',
    laborCost: 0,
    production: {
      gold: 5,
      food: 2,
      labor: 5,
      culture: 1,
      science: 3,
    },
    technologies: [],
  },
  {
    name: 'granary',
    laborCost: 60,
    production: {
      gold: -1,
      food: 2,
      labor: 0,
      culture: 0,
      science: 0,
    },
    technologies: ['agriculture'],
  },
  {
    name: 'workshop',
    laborCost: 120,
    production: {
      gold: -2,
      food: 0,
      labor: 2,
      culture: 0,
      science: 0,
    },
    technologies: [],
  },
];

module.exports = buildingList;
