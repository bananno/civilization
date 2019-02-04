const Game = require('../models/game');
const Player = require('../models/player');
const Tile = require('../models/tile');
const Unit = require('../models/unit');

function getData(req, res, next, callback) {
  Game.findById(req.session.gameId, (error, game) => {
    if (error) {
      return next(error);
    }
    if (game == null) {
      return res.redirect('/loadGame');
    }
    Player.find({ game: game }, (error, players) => {
      if (error) {
        return next(error);
      }
      Tile.find({ game: game }, (error, tiles) => {
        if (error) {
          return next(error);
        }
        Unit.find({ game: game }, (error, units) => {
          if (error) {
            return next(error);
          }
          callback({
            game: game,
            players: players,
            tiles: tiles,
            units: units,
          });
        });
      });
    });
  });
}

module.exports = getData;
