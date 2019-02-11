
const buildingTypes = [
  {
    name: 'palace',
    laborCost: 0,
    production: {
      gold: 5,
      food: 2,
      labor: 5,
    },
  },
  {
    name: 'granary',
    laborCost: 60,
    production: {
      gold: -1,
      food: 2,
      labor: 0,
    },
  }
];

module.exports = buildingTypes;
