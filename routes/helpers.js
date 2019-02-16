
const helpers = {};

helpers.sameLocation = (arr1, arr2) => {
  return arr1[0] == arr2[0] && arr1[1] == arr2[1];
};

helpers.getColumn = (numCols, c) => {
  if (c < 0) {
    return c + numCols;
  }
  if (c >= numCols) {
    return c - numCols;
  }
  return c;
};

helpers.findUnit = (units, id) => {
  return units.filter(unit => {
    return unit._id == id;
  })[0];
};

helpers.findTile = (tiles, row, column) => {
  if (row.constructor == Array) {
    [row, column] = row;
  }
  return tiles.filter(tile => {
    return helpers.sameLocation(tile.location, [row, column]);
  })[0];
};

helpers.getRandomInt = (min, max) => {
  Math.floor(Math.random() * (max + 1 - min)) + min;
};

helpers.booleanByPercentage = (percentage) => {
  return getRandomInt(0, 100) <= percentage;
};

module.exports = helpers;
