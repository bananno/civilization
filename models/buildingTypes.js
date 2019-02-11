
const buildingTypes = [
  {
    name: 'palace',
    cost: 0,
    production: {
      gold: 5,
      food: 2,
      work: 5,
    },
  },
  {
    name: 'granary',
    cost: 60,
    production: {
      gold: -1,
      food: 2,
      work: 0,
    },
  }
];

module.exports = buildingTypes;
