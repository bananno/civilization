var mongoose = require('mongoose');

var PlayerSchema = new mongoose.Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  name: {
    type: String,
  },
  turn: {
    type: Number,
    default: 0,
  },
});

var Player = mongoose.model('Player', PlayerSchema);
module.exports = Player;
