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
  row: {
    type: Number,
  },
  column: {
    type: Number,
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
  progress: {
    type: Number,
    default: 0,
  },
  food: {
    type: Number,
    default: 1,
  },
  gold: {
    type: Number,
    default: 1,
  },
  terrain: {
    ground: {
      type: String,
      default: 'grassland',
      // grassland, plains, desert, tundra, coast, ocean
    },
    forest: Boolean,
    hill: Boolean,
    mountain: Boolean,
  },
});

var Tile = mongoose.model('Tile', TileSchema);
module.exports = Tile;
