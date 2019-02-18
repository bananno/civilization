const mapPatterns = require('../models/mapPatterns');

const createMap = (game) => {
  const [numRows, numCols] = game.mapSize;

  const map = [];
  const tiles = [];

  for (let r = 0; r < numRows; r++) {
    map[r] = [];
    for (let c = 0; c < numCols; c++) {
      let tileData = {
        game: game,
        location: [r, c],
        discovered: [],
        production: {
          food: 1,
          gold: 1,
          labor: 1,
          culture: 0,
          science: 0,
        },
        terrain: {
          ground: null,
          forest: false,
          hill: false,
          mountain: false,
          water: true,
        },
      };

      map[r][c] = tileData;
      tiles.push(tileData);
    }
  }

  return tiles;
};

module.exports = createMap;
