const {
  Game,
  getData,
  getVisibleTilesFunction,
  helpers,
} = require('./import');

module.exports = {
  getHomePage,
  newGameGet,
  loadGameGet,
  loadGamePost,
  exitGame,
  zoom,
};

const zoomLimit = [1, 3];

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
  req.session.gameId = req.params.gameId;
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

function exitGame(req, res, next) {
  if (req.session) {
    req.session.destroy((error) => {
      if (error) {
        next(error);
      } else {
        res.redirect('/loadGame');
      }
    });
  }
}

function zoom(req, res, next) {
  const gameId = req.session ? req.session.gameId : null;

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
