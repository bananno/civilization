module.exports = [
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
    name: 'mining',
    scienceCost: 35,
    blocked: ['agriculture'],
  },
  {
    name: 'animal husbandry',
    scienceCost: 55,
    blocked: ['hunting', 'agriculture'],
  },
  {
    name: 'bronze working',
    scienceCost: 55,
    blocked: ['mining'],
  },
  {
    name: 'sailing',
    scienceCost: 55,
    blocked: [],
  },
];
