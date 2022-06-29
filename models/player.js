const mongoose = require('mongoose');
const technologyList = require('./technologyList');

const PlayerSchema = new mongoose.Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  name: {
    type: String,
  },
  storage: {
    gold: {
      type: Number,
      default: 0,
    },
    culture: {
      type: Number,
      default: 0,
    },
    science: {
      type: Number,
      default: 0,
    },
  },
  technologies: [],
  researchAutomate: Boolean,
  researchCurrent: Number,
  researchProgress: [],
});

// Get the active player for the given game id.
PlayerSchema.statics.getActivePlayer = async function(gameId) {
  const game = await mongoose.model('Game').findById(gameId);
  const players = await mongoose.model('Player').find({game: gameId});
  return players[game.nextPlayer];
};

PlayerSchema.methods.hasTechnology = function(technologyName) {
  return this.technologies.some(techIndex => {
    return technologyList[techIndex].name === technologyName;
  });
};

mongoose.model('Player', PlayerSchema);
