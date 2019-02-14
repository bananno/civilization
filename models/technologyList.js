
const technologyList = [
  {
    name: 'agriculture',
    scienceCost: 20,
  },
  {
    name: 'hunting',
    scienceCost: 30,
    blocked: ['agriculture'],
  },
  {
    name: 'animal husbandry',
    scienceCost: 55,
    blocked: ['hunting', 'agriculture'],
  },
];

module.exports = technologyList;
