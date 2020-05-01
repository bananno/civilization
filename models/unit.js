const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
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
  templateName: String,
  moves: {
    type: Number,
    default: 1,
  },
  movesRemaining: {
    type: Number,
    default: 1,
  },
  orders: {
    type: String,
    default: null
  },
  automate: {
    type: Boolean,
    default: false,
  },
});

mongoose.model('Unit', UnitSchema);
