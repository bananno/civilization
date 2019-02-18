const Unit = require('../models/unit');
const unitList = require('../models/unitList');

const createUnit = (unitData, callback) => {
  let index = unitData.templateIndex;

  if (index == null && unitData.templateName != null) {
    index = unitList.filter(template => template.name == unitData.templateName)[0];
  };

  unitData.templateName = unitList[index].name;
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
