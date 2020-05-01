const mongoose = require('mongoose');
const unitList = require('../models/unitList');

const UnitSchema = new mongoose.Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  },
  location: {
    type: Array,
  },
  templateName: String,
  moves: {
    type: Number,
    default: 1,
  },
  movesRemaining: {
    type: Number,
    default: 1,
  },
  orders: {
    type: String,
    default: null
  },
  automate: {
    type: Boolean,
    default: false,
  },
});

UnitSchema.statics.createNew = async function(unitData) {
  let unitTemplate;

  if (unitData.templateIndex) {
    unitTemplate = unitList[unitData.templateIndex];
  } else {
    unitTemplate = unitList.find(template => {
      return template.name === unitData.templateName;
    });
  }

  unitData.templateName = unitTemplate.name;
  unitData.moves = unitData.moves || unitTemplate.moves;
  unitData.movesRemaining = unitData.movesRemaining || unitTemplate.moves;

  return await mongoose.model('Unit').create(unitData);
};

mongoose.model('Unit', UnitSchema);
