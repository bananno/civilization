const {
  Game,
  getData,
  getVisibleTilesFunction,
  helpers,
  Player,
  Session,
} = require('./import');

module.exports = {
  getAllGames,
  getOneGame,
  getHomePage,
  newGameGet,
  loadGameGet,
  loadGamePost,
  exitGame,
  zoom,
};

const zoomLimit = [1, 3];

async function getAllGames(req, res) {
  const games = await Game.find();
  res.send(games);
}

// GET http://localhost:1776/game/:id
// GET http://localhost:1776/game/:id?players=true
function getOneGame(req, res) {
  Game.findById(req.params.id, async (error, game) => {
    if (error) {
      return res.send(error);
    }
    if (!game) {
      return res.status(404).send(null);
    }
    const result = {
      id: game._id,
      mapSize: game.mapSize,
      name: game.name,
      nextPlayer: game.nextPlayer,
      turn: game.turn,
      zoom: game.zoom,
    };
    if (req.query.players) {
      result.players = await Player.find({game});
    }
    res.send(result);
  });
}

function getHomePage(req, res, next) {
  getData(req, res, next, (data) => {
    data.helpers = helpers;
    data.getVisibleTiles = getVisibleTilesFunction(data);
    data.zoomLimit = zoomLimit;
    res.render('game/index', data);
  });
}

function loadGameGet(req, res, next) {
  Game.find({ }, function (error, games) {
    if (error) {
      res.send({ message: 'ERROR: ' + error });
    } else {
      if (games.length === 0) {
        res.redirect('/newGame');
      } else {
        res.render('loadGame', {
          games: games
        });
      }
    }
  });
}

function loadGamePost(req, res, next) {
  Session.setCurrentGameId(req, gameId);
  res.redirect('/');
}

function newGameGet(req, res, next) {
  Game.find({ }, function (error, games) {
    if (error) {
      return res.send({ message: 'ERROR: ' + error });
    }
    res.render('newGame', {
      numberOfGames: games.length
    });
  });
}

async function exitGame(req, res, next) {
  await Session.clearCurrentGameId(req);
  res.redirect('/loadGame');
}

function zoom(req, res, next) {
  const gameId = Session.getCurrentGameId(req);

  let direction = parseInt(req.body.direction);

  if (direction == 0) {
    direction = -1;
  } else if (direction != 1) {
    const error = new Error('Invalid zoom input.');
    error.status = 412;
    return next(error);
  }

  Game.findById(gameId, (error, game) => {
    if (error) {
      return next(error);
    }

    const newZoom = game.zoom + direction;

    if (newZoom < zoomLimit[0] || newZoom > zoomLimit[1]) {
      const error = new Error('Zoom is out of range.');
      error.status = 412;
      return next(error);
    }

    Game.update(game, { zoom: newZoom }, error => {
      if (error) {
        return next(error);
      }
      res.send({ success: true });
    });
  });
}
