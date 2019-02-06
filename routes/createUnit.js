const Unit = require('../models/unit');
const unitTypes = require('../models/unitTypes');

const createUnit = (unitData, callback) => {
  let index = unitData.unitTypeIndex || 0;

  unitData.unitType = unitData.unitType || unitTypes[index];
  unitData.moves = unitData.moves || unitTypes[index].moves;
  unitData.movesRemaining = unitData.movesRemaining || unitTypes[index].moves;

  Unit.create(unitData, (error, unit) => {
    if (error) {
      console.log('Error creating unit');
      console.log(error);
    } else {
      callback();
    }
  });
};

module.exports = createUnit;
