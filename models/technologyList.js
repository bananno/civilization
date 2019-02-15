
const technologyList = [
  {
    name: 'agriculture',
    scienceCost: 20,
    blocked: [],
  },
  {
    name: 'hunting',
    scienceCost: 30,
    blocked: [],
  },
  {
    name: 'animal husbandry',
    scienceCost: 55,
    blocked: ['hunting', 'agriculture'],
  },
];

module.exports = technologyList;
