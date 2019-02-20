var mongoose = require('mongoose');

var GameSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  turn: {
    type: Number,
    default: 0,
  },
  nextPlayer: {
    type: Number,
    default: 0,
  },
  mapSize: {
    type: Array,
  },
  zoom: {
    type: Number,
    default: 1,
  },
});

var Game = mongoose.model('Game', GameSchema);
module.exports = Game;
