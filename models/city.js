const mongoose = require('mongoose');
const buildingList = require('./buildingList');

const CitySchema = new mongoose.Schema({
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
  population: {
    type: Number,
    default: 1,
  },
  buildings: {
    type: Array,
  },
  project: {
    category: {
      type: String,
    },
    index: {
      type: Number,
    },
  },
  projectProgress: {
    unit: [],
    building: [],
  },
  projectAutomate: Boolean,
  storage: {
    food: Number,
    labor: Number,
    culture: Number,
  },
  borderExpansions: {
    type: Number,
    default: 0,
  },
});

function forEachProductionType(func) {
  ['gold', 'food', 'labor', 'culture', 'science'].forEach(func);
}

// Get the total net production of the city, including buildings, tiles, and
// other factors like the workshop bonus.
CitySchema.methods.getTotalProduction = async function() {
  const production = {gold: 0, food: 0, labor: 0, culture: 0, science: 0};

  const workedTiles = await mongoose.model('Tile').find({worked: this});

  workedTiles.forEach(tile => {
    forEachProductionType(prodType => {
      production[prodType] += tile.production[prodType];
    });
  });

  this.buildings.forEach(buildingId => {
    forEachProductionType(prodType => {
      production[prodType] += buildingList[buildingId].production[prodType];
    });
  });

  const workshopIndex = buildingList.find(building => building.name === 'workshop');
  if (this.buildings.includes(workshopIndex)) {
    // The displayed value should be rounded, but the actual value should not.
    // If the original labor was 1, then every 10 turns there will be labor bonus of 1.
    production.labor *= 1.1;
  }

  return production;
};

CitySchema.methods.getNumUnemployedCitizens = async function() {
  const workedTiles = await mongoose.model('Tile').find({worked: this});
  // population+1 because the city itself is worked for free.
  return (this.population + 1) - workedTiles.length;
};

mongoose.model('City', CitySchema);
