
function findUnit(units, id) {
  return units.filter(unit => {
    return unit._id == id;
  })[0];
}

function findTile(tiles, row, column) {
  if (row.constructor == Array) {
    [row, column] = row;
  }
  return tiles.filter(tile => {
    return tile.row == row && tile.column == column;
  })[0];
}

function booleanByPercentage(percentage) {
  return Math.round(Math.random() * 100) <= percentage;
}

module.exports = {
  findUnit: findUnit,
  findTile: findTile,
  booleanByPercentage: booleanByPercentage,
};
