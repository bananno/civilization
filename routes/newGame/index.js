const {
  Game,
  Player,
  Tile,
  Unit,
  helpers,
  getVisibleTilesFunction,
} = require('../import');

const createMap = require('./createMap');
const chooseUnitLocations = require('./chooseUnitLocations');

module.exports = newGame;

async function newGame(req, res, next) {
  const game = await Game.createFromForm(req.body);
  Session.setCurrentGameId(req, game._id);

  const numPlayers = 2;

  let tileList = createMap(game);

  const unitLocations = chooseUnitLocations(tileList, numPlayers);

  const getVisibleTiles = getVisibleTilesFunction({
    game: {mapSize: game.mapSize},
    tiles: tileList,
  });

  for (let i = 0; i < numPlayers; i++) {
    const newPlayer = {
      game: game,
      name: req.body['playername_' + i].trim() || 'Player ' + (i + 1),
    };

    const player = await Player.create(newPlayer);

    const newUnit1 = {
      game: game,
      player: player,
      location: unitLocations[i][0],
      templateName: 'settler',
    };

    const newUnit2 = {
      game: game,
      player: player,
      location: unitLocations[i][1],
      templateName: 'scout',
    };

    await Unit.createNew(newUnit1);
    await Unit.createNew(newUnit2);

    let revealedTiles = [];

    revealedTiles = revealedTiles.concat(getVisibleTiles(newUnit1.location));
    revealedTiles = revealedTiles.concat(getVisibleTiles(newUnit2.location));

    revealedTiles.forEach(pair => {
      tileList = tileList.map(tile => {
        if (helpers.sameLocation(pair, tile.location)) {
          tile.discovered.push(player);
        }
        return tile;
      });
    });
  }

  for (let i in tileList) {
    await Tile.create(tileList[i]);
  }

  res.redirect('/');
}
