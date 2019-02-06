var mongoose = require('mongoose');

var CitySchema = new mongoose.Schema({
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
  buildings: {
    type: Array,
  },
});

var City = mongoose.model('City', CitySchema);
module.exports = City;
