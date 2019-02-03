var mongoose = require('mongoose');

var PlayerSchema = new mongoose.Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  name: {
    type: String,
    unique: true,
    required: true,
  },
});

var Player = mongoose.model('Player', PlayerSchema);
module.exports = Player;
