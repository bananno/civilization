const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
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

mongoose.model('Game', GameSchema);
