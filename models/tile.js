var mongoose = require('mongoose');

var TileSchema = new mongoose.Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: false,
    default: null,
  },
  location: {
    type: Array,
  },
  discovered: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  }],
  worked: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
  },
  improvement: {
    type: String,
  },
  project: String,
  progress: {
    type: Number,
    default: 0,
  },
  road: {
    type: Boolean,
    default: false,
  },
  roadProgress: {
    type: Number,
    default: 0,
  },
  production: {
    food: {
      type: Number,
      default: 0,
    },
    gold: {
      type: Number,
      default: 0,
    },
    labor: {
      type: Number,
      default: 0,
    },
    culture: {
      type: Number,
      default: 0,
    },
    science: {
      type: Number,
      default: 0,
    },
  },
  terrain: {
    ground: String,
    forest: Boolean,
    hill: Boolean,
    mountain: Boolean,
    water: Boolean,
  },
});

var Tile = mongoose.model('Tile', TileSchema);
module.exports = Tile;
