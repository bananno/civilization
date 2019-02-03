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
});

var Player = mongoose.model('Player', PlayerSchema);
module.exports = Player;
