const {
  City,
  Player,
  Session,
  Tile,
} = require('./import');

module.exports = postWorkTile;

async function postWorkTile(req, res) {
  const {cityId, tileId} = req.params;

  const {errorCode, errorInfo, city, tile} = await getCityAndTileIfValid(req);

  if (errorCode) {
    return res.status(errorCode).send(errorInfo);
  }

  try {
    await Tile.updateOne({_id: tile._id}, {worked: tile.worked ? null : city._id});
  } catch (error) {
    return res.status(500).send({...error});
  }

  res.status(200).send();
}

// Get the city and tile for the request.
// - The city and tile must both belong to the same player, which must be the
//     current active player in the current session game.
// - The tile must not be worked by another city.
// - The tile must have some production value.
// - The city must have an unemployed citizen to add a worked tile.
// Add later: the tile must be within a certain distance of the city.
async function getCityAndTileIfValid(req) {
  try {
    const currentGameId = Session.getCurrentGameId(req);
    if (!currentGameId) {
      return {errorCode: 401, errorInfo: 'no active game'};
    }

    const {cityId, tileId} = req.params;

    const player = await Player.getActivePlayer(currentGameId);

    const city = await City.findOne({_id: cityId, player});
    const tile = await Tile.findById({_id: tileId, player});

    if (!city || !tile) {
      return {errorCode: 404, errorInfo: 'city or tile not found'};
    }

    if (tile.worked) {
      if (`${tile.worked}` !== cityId) {
        return {errorCode: 409, errorInfo: 'tile is worked by another city'};
      }
      // else, the tile is being toggled OFF for this city
    } else {
      if (tile.getTotalProduction() === 0) {
        return {errorCode: 409, errorInfo: 'tile has no production value'};
      }
      const numUnemployedCitizens = await city.getNumUnemployedCitizens();
      if (numUnemployedCitizens === 0) {
        return {errorCode: 409, errorInfo: 'city has no unemployed citizens'};
      }
    }

    return {city, tile};
  } catch (error) {
    return {errorCode: 500, errorInfo: error};
  }
}
