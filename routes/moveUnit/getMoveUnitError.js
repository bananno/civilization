
function getMoveUnitError(data, unit, oldRow, oldCol, newRow, newCol, newTile) {
  const [numRows, numCols] = data.game.mapSize;

  if (unit.movesRemaining == 0) {
    return 'Unit has no moves left.';
  }

  if (newRow < 0 || newRow >= numRows) {
    return 'Destination is not a valid location.';
  }

  if (!data.help.isTileAdjacent(oldRow, oldCol, newRow, newCol)) {
    return 'Destination is not adjacent to origin.';
  }

  const unitsInNewSpace = data.units.filter(otherUnit => {
    return data.help.isSameLocation(otherUnit.location, [newRow, newCol]);
  });

  if (unitsInNewSpace.length) {
    return 'Destination is already occupied by another unit.';
  }

  if (newTile.improvement == 'city') {
    const cityInNewSpace = data.cities.filter(city => {
      return data.help.isSameLocation(city.location, [newRow, newCol]);
    })[0];

    if (!data.help.isCurrentPlayer(cityInNewSpace.player)) {
      return 'Unit cannot enter a rival city.';
    }
  }

  if (newTile.terrain.mountain) {
    return 'Mountain tile is impassable.';
  }

  if (unit.templateName == 'galley') {
    if (!newTile.terrain.water && newTile.improvement != 'city') {
      return 'Land tile is impassable.';
    }
  } else if (newTile.terrain.water){
    return 'Water tile is impassable.';
  }

  return null;
}

module.exports = getMoveUnitError;
