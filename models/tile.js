var mongoose = require('mongoose');

var TileSchema = new mongoose.Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
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
    required: true,
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: false,
    default: null,
  },
  improvement: {
    type: String,
  },
  progress: {
    type: Number,
    default: 0,
  },
});

var Tile = mongoose.model('Tile', TileSchema);
module.exports = Tile;
