const Unit = require('../models/unit');
const unitList = require('../models/unitList');

const createUnit = (unitData, callback) => {
  let index = unitData.unitTypeIndex || 0;

  unitData.unitType = unitData.unitType || unitList[index];
  unitData.moves = unitData.moves || unitList[index].moves;
  unitData.movesRemaining = unitData.movesRemaining || unitList[index].moves;

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
