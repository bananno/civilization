const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
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

mongoose.model('City', CitySchema);
