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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  },
});

GameSchema.statics.authenticate = (username, callback) => {
  Game.findOne({ username: username }, (error, game) => {
    if (error) {
      return callback(error)
    } else if (!user) {
      let newError = new Error('Game not found.');
      newError.status = 401;
      return callback(newError);
    }
  });
};

var Game = mongoose.model('Game', GameSchema);
module.exports = Game;
