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
  tile: {
    type: Array,
  },
});

var Unit = mongoose.model('Unit', UnitSchema);
module.exports = Unit;