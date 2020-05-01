const {
  express,
  Game,
  Player,
  Tile,
  Unit,
  createUnit,
  helpers,
  getVisibleTilesFunction,
} = require('../import');

const router = express.Router();

const createMap = require('./createMap');
const chooseUnitLocations = require('./chooseUnitLocations');

router.post('/newGame', newGame);

async function newGame(req, res, next) {
  const game = await createGame(req.body);

  req.session.gameId = game._id;

  const numPlayers = 2;

  let tileList = createMap(game);

  const unitLocations = chooseUnitLocations(tileList, numPlayers);

  const getVisibleTiles = getVisibleTilesFunction({
    game: { mapSize: game.mapSize },
    tiles: tileList,
  });

  const createPlayer = (i) => {
    var playerData = {
      game: game,
      name: req.body['playername_' + i].trim() || 'Player ' + (i + 1),
    };

    Player.create(playerData, (error, player) => {
      if (error) {
        return next(error);
      }

      var tempUnit1 = {
        game: game,
        player: player,
        location: unitLocations[i][0],
        templateName: 'settler',
      };

      var tempUnit2 = {
        game: game,
        player: player,
        location: unitLocations[i][1],
        templateName: 'scout',
      };

      let revealedTiles = [];

      revealedTiles = revealedTiles.concat(getVisibleTiles(tempUnit1.location));
      revealedTiles = revealedTiles.concat(getVisibleTiles(tempUnit2.location));

      revealedTiles.forEach(pair => {
        tileList = tileList.map(tile => {
          if (helpers.sameLocation(pair, tile.location)) {
            tile.discovered.push(player);
          }
          return tile;
        });
      });

      createUnit(tempUnit1, () => {
        createUnit(tempUnit2, () => {
          if (i < numPlayers - 1) {
            createPlayer(i + 1);
          } else {
            createTile(0);
          }
        });
      });
    });
  };

  const createTile = (i) => {
    if (i >= tileList.length) {
      res.redirect('/');
    } else {
      Tile.create(tileList[i], (error, tile) => {
        if (error) {
          return next(error);
        }
        createTile(i + 1);
      });
    }
  }

  createPlayer(0);
}

async function createGame(params) {
  let numRows = parseInt(params.rows || 0);
  let numCols = parseInt(params.columns || 0);
  let gameName = getGameName(params.name);

  if (numRows < 10) {
    numRows = 10;
  } else if (numRows > 30) {
    numRows = 30;
  }

  if (numCols < 20) {
    numCols = 20;
  } else if (numCols > 50) {
    numCols = 50;
  }

  const gameData = {
    name: gameName,
    mapSize: [numRows, numCols],
  };

  return await new Promise(resolve => {
    Game.create(gameData, (error, game) => {
      resolve(game);
    });
  });
}

function getGameName(inputName) {
  inputName = (inputName || '').trim();

  if (inputName.length) {
    return inputName;
  }

  const randomNumber = ('' + Math.random()).slice(2, 10);

  return 'Game' + randomNumber;
}

module.exports = router;
