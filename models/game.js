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

GameSchema.statics.createFromForm = async function(formData) {
  let numRows = parseInt(formData.rows || 0);
  let numCols = parseInt(formData.columns || 0);
  let gameName = (formData.name || '').trim();

  if (!gameName.length) {
    const randomNumber = ('' + Math.random()).slice(2, 10);
    gameName = 'Game' + randomNumber;
  }

  if (numRows < 10) {
    numRows = 10;
  } else if (numRows > 30) {
    numRows = 30;
  }

  if (numCols < 20) {
    numCols = 20;
  } else if (numCols > 50) {
    numCols = 50;
  }

  const newGame = {
    name: gameName,
    mapSize: [numRows, numCols],
  };

  const game = await mongoose.model('Game').create(newGame);

  return game;
};

mongoose.model('Game', GameSchema);
