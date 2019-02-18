const Unit = require('../models/unit');
const unitList = require('../models/unitList');

const createUnit = (unitData, callback) => {
  let unitTemplate;

  if (unitData.templateIndex) {
    unitTemplate = unitList[unitData.templateIndex];
  } else {
    unitTemplate = unitList.filter(template => {
      return template.name == unitData.templateName;
    })[0];
  }

  unitData.templateName = unitTemplate.name;
  unitData.moves = unitData.moves || unitTemplate.moves;
  unitData.movesRemaining = unitData.movesRemaining || unitTemplate.moves;

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
