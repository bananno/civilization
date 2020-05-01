const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TileSchema = new mongoose.Schema({
  game: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  player: {
    type: Schema.Types.ObjectId,
    ref: 'Player',
    required: false,
    default: null,
  },
  location: {
    type: Array,
  },
  discovered: [{
    type: Schema.Types.ObjectId,
    ref: 'Player',
  }],
  worked: {
    type: Schema.Types.ObjectId,
    ref: 'City',
  },
  improvement: {
    type: String,
  },
  project: String,
  progress: {
    type: Number,
    default: 0,
  },
  road: {
    type: Boolean,
    default: false,
  },
  roadProgress: {
    type: Number,
    default: 0,
  },
  production: {
    food: {
      type: Number,
      default: 0,
    },
    gold: {
      type: Number,
      default: 0,
    },
    labor: {
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
  terrain: {
    ground: String,
    forest: Boolean,
    hill: Boolean,
    mountain: Boolean,
    water: Boolean,
  },
});

TileSchema.methods.getTotalProduction = function() {
  return ['gold', 'food', 'labor', 'culture', 'science'].reduce((total, prod) => {
    return this.production[prod] + total;
  }, 0);
};

mongoose.model('Tile', TileSchema);
