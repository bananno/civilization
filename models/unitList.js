
const unitList = [
  {
    name: 'settler',
    moves: 2,
    laborCost: 106,
    technologies: [],
    water: false,
  },
  {
    name: 'scout',
    moves: 2,
    laborCost: 25,
    technologies: [],
    water: false,
  },
  {
    name: 'worker',
    moves: 2,
    laborCost: 70,
    technologies: [],
    water: false,
  },
  {
    name: 'galley',
    moves: 2,
    laborCost: 100,
    technologies: ['sailing'],
    water: true,
  },
];

module.exports = unitList;
