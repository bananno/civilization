var mongoose = require('mongoose');

var UnitSchema = new mongoose.Schema({
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
  unitType: {
    name: {
      type: String,
    },
  },
  moves: {
    type: Number,
    default: 1,
  },
  movesRemaining: {
    type: Number,
    default: 1,
  },
});

var Unit = mongoose.model('Unit', UnitSchema);
module.exports = Unit;
