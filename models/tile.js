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
});

var Tile = mongoose.model('Tile', TileSchema);
module.exports = Tile;
