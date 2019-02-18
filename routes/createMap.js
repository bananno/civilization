const mapPatterns = require('../models/mapPatterns');
const helpers = require('./helpers');

const map = [];
const tiles = [];
let numRows, numCols;

function createMap(game) {
  [numRows, numCols] = game.mapSize;

  createBasicMap(game);

  for (let count = 0; count < 10; count++) {
    addLandPattern();
  }

  return tiles;
}

function createBasicMap(game) {
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
}

function addLandPattern() {
  const patternNumber = helpers.getRandomInt(0, mapPatterns.land.length - 1);
  const pattern = mapPatterns.land[patternNumber];
  const startRangeRow = 0 - pattern.length;
  const endRangeRow = numRows + pattern.length;

  const startRow = helpers.getRandomInt(startRangeRow, endRangeRow);
  const startCol = helpers.getRandomInt(0, numCols);

  for (let r1 = 0; r1 < pattern.length; r1++) {
    let r = startRow + r1;

    if (r < 0) {
      continue;
    }

    if (r >= numRows) {
      break;
    }

    for (let c1 = 0; c1 < pattern[0].length; c1++) {
      if (pattern[r1][c1] == 1) {
        let c = helpers.getColumn(numCols, startCol + c1);
        map[r][c].terrain.ground = 'grassland';
        map[r][c].terrain.water = false;
      }
    }
  }
}

module.exports = createMap;