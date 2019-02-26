var mongoose = require('mongoose');

var CitySchema = new mongoose.Schema({
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
  population: {
    type: Number,
    default: 1,
  },
  buildings: {
    type: Array,
  },
  project: {
    category: {
      type: String,
    },
    index: {
      type: Number,
    },
  },
  projectProgress: {
    unit: [],
    building: [],
  },
  projectAutomate: Boolean,
  storage: {
    food: Number,
    labor: Number,
    culture: Number,
  },
  borderExpansions: {
    type: Number,
    default: 0,
  },
});

var City = mongoose.model('City', CitySchema);
module.exports = City;
