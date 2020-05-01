const mongoose = require('mongoose');

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

mongoose.model('Player', PlayerSchema);
