
const helpers = {};

helpers.sameLocation = (arr1, arr2) => {
  return arr1[0] == arr2[0] && arr1[1] == arr2[1];
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

helpers.booleanByPercentage = (percentage) => {
  return Math.round(Math.random() * 100) <= percentage;
}

module.exports = helpers;
