
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
  return Math.floor(Math.random() * (max + 1 - min)) + min;
};

helpers.booleanByPercentage = (percentage) => {
  return helpers.getRandomInt(0, 100) <= percentage;
};

function getAdjacentDirection(numCols, fromRow, fromCol, toRow, toCol) {
  if (fromRow.constructor == Array) {
    [toRow, toCol] = [fromCol, toRow];
    [fromRow, fromCol] = fromRow;
  }
  if (toRow.constructor == Array) {
    [toRow, toCol] = toRow;
  }

  if (toCol == 0 && fromCol == numCols - 1) {
    toCol = numCols;
  } else if (fromCol == 0 && toCol == numCols - 1) {
    toCol = -1;
  }

  if (toRow == fromRow) {
    if (toCol == fromCol - 1) {
      return 'left';
    }

    if (toCol == fromCol + 1) {
      return 'right';
    }

    return null;
  }

  let shift = fromRow % 2;

  if (toRow == fromRow - 1) {
    if (toCol == fromCol - shift + 1) {
      return 'up-right';
    }
    if (toCol == fromCol - shift) {
      return 'up-left';
    }
  } else if (toRow == fromRow + 1) {
    if (toCol == fromCol - shift + 1) {
      return 'down-right';
    }
    if (toCol == fromCol - shift) {
      return 'down-left';
    }
  }

  return null;
}

helpers.isTileAdjacent = (numCols, oldRow, oldCol, newRow, newCol) => {
  let colDistance = newCol - oldCol;

  if (colDistance == numCols - 1) {
    colDistance = -1;
  } else if (colDistance == -(numCols - 1)) {
    colDistance = 1;
  }

  if (newRow == oldRow) {
    return Math.abs(colDistance) == 1;
  }

  if (Math.abs(oldRow - newRow) != 1) {
    return false;
  }

  if (colDistance == 0) {
    return true;
  }

  if (oldRow % 2 == 0) {
    return colDistance == 1;
  }

  return colDistance == -1;
};

helpers.getSurroundingCoords = (numRows, numCols, row, col, range, blocker) => {
  const shift = -(row % 2);
  const pairs = [
    [-1, shift],
    [-1, 1 + shift],
    [0, -1],
    [0, 1],
    [1, shift],
    [1, 1 + shift],
  ];

  blocker = blocker || {};

  let coords = pairs.map(pair => {
    let r = pair[0] + row;
    let c = helpers.getColumn(numCols, pair[1] + col);

    if (r < 0 || r >= numRows) {
      return null;
    }

    if (blocker[r + ',' + c]) {
      return null;
    }

    blocker[r + ',' + c] = true;

    return [r, c];
  }).filter(pair => pair != null);

  if (range > 1) {
    const tempCoords = [...coords];
    tempCoords.forEach(pair => {
      let [r, c] = pair;
      const newCoords = helpers.getSurroundingCoords(numRows, numCols, r, c, range - 1, blocker);
      coords = coords.concat(newCoords);
    });
  }

  return coords;
};

helpers.forEachAdjacentTile = (numRows, numCols, tiles, row, col, callback) => {
  const coords = helpers.getSurroundingCoords(numRows, numCols, row, col, 1);
  coords.forEach(pair => {
    const [r, c] = pair;
    const tile = helpers.findTile(tiles, r, c);
    if (tile) {
      callback(tile, r, c);
    }
  });
};

function isSamePlayer(player1, player2) {
  if (player1 == null || player2 == null) {
    return player1 == null && player2 == null;
  }
  return '' + (player1._id || player1) == '' + (player2._id || player2);
}

function getCityWorkableTiles(data, city, newHelpers) {
  const adjacentTiles = [[], [], []];
  const workableTiles = [];
  const alreadyCovered = {};

  const cityTile = data.tileRef[city.location[0]][city.location[1]];

  alreadyCovered[cityTile._id] = true;

  newHelpers.forEachAdjacentTile(city.location, tile => {
    adjacentTiles[0].push(tile);
  });

  for (let i = 0; i < 2; i++) {
    adjacentTiles[i].forEach(tile => {
      newHelpers.forEachAdjacentTile(tile.location, tile => {
        adjacentTiles[i + 1].push(tile);
      });
    });
  }

  for (let i = 0; i < 3; i++) {
    adjacentTiles[i].forEach(tile => {

      if (alreadyCovered[tile._id]) {
        return;
      }

      alreadyCovered[tile._id] = true;

      if (!newHelpers.isCurrentPlayer(tile.player)) {
        return;
      }

      if (tile.worked && ('' + tile.worked != '' + city._id)) {
        return;
      }

      if (newHelpers.getTileTotalProduction(tile) == 0) {
        return;
      }

      workableTiles.push(tile);
    });
  }

  return workableTiles;
}

function getCityClaimableTiles(data, city, newHelpers) {
  const alreadyCovered = {};
  const claimableTiles = [];
  newHelpers.getCityWorkableTiles(city).forEach(ownedTile => {
    newHelpers.forEachAdjacentTile(ownedTile.location, outerTile => {
      if (outerTile.player || alreadyCovered[outerTile._id]) {
        return;
      }
      alreadyCovered[outerTile._id] = true;
      claimableTiles.push(outerTile);
    });
  });
  return claimableTiles;
}

helpers.makeHelperFunctions = (data) => {
  const newHelpers = {};
  const [numRows, numCols] = data.game.mapSize;

  newHelpers.sameLocation = (arr1, arr2) => {
    return arr1[0] == arr2[0] && arr1[1] == arr2[1];
  };

  newHelpers.isSamePlayer = (player1, player2) => {
    return isSamePlayer(player1, player2);
  };

  newHelpers.isCurrentPlayer = (player) => {
    return isSamePlayer(player, data.currentPlayer);
  };

  newHelpers.getColumn = (col) => {
    return helpers.getColumn(numCols, col);
  };

  newHelpers.findTile = (row, col) => {
    if (row.constructor == Array) {
      [row, col] = row;
      return data.tileRef[row] ? data.tileRef[row][col] : null;
    }
    if (col) {
      return data.tileRef[row] ? data.tileRef[row][col] : null;
    }
    return data.tileRef[row];
  };

  newHelpers.forEachAdjacentTile = (row, col, callback) => {
    if (row.constructor == Array) {
      callback = col;
      [row, col] = row;
    }
    return helpers.forEachAdjacentTile(numRows, numCols, data.tiles, row, col, callback);
  };

  newHelpers.getTileTotalProduction = (tile) => {
    return ['gold', 'food', 'labor', 'culture', 'science'].reduce((total, prod) => {
      return total + tile.production[prod];
    }, 0);
  };

  newHelpers.getCityWorkableTiles = (city) => {
    return getCityWorkableTiles(data, city, newHelpers);
  };

  newHelpers.getCityClaimableTiles = (city) => {
    return getCityClaimableTiles(data, city, newHelpers);
  };

  newHelpers.numCityUnemployedCitizens = (city) => {
    const cityTilesWorked = data.tiles.filter(tile => {
      return '' + tile.worked == '' + city._id;
    });
    return city.population - cityTilesWorked.length + 1;
  };

  newHelpers.getAdjacentDirection = (fromRow, fromCol, toRow, toCol) => {
    return getAdjacentDirection(numCols, fromRow, fromCol, toRow, toCol);
  };

  return newHelpers;
};

module.exports = helpers;
