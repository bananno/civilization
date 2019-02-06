const Game = require('../models/game');
const Player = require('../models/player');
const Tile = require('../models/tile');
const City = require('../models/city');
const Unit = require('../models/unit');
const buildingTypes = require('../models/buildingTypes');
const unitTypes = require('../models/unitTypes');

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
        City.find({ game: game }, (error, cities) => {
          if (error) {
            return next(error);
          }
          Unit.find({ game: game }, (error, units) => {
            if (error) {
              return next(error);
            }

            let goldPerTurn = {};

            players.forEach(player => {
              goldPerTurn[player._id] = 0;
            });

            cities.forEach(city => {
              city.buildings.forEach(i => {
                let building = buildingTypes[i];
                goldPerTurn[city.player] += building.gold;
              });
            });

            callback({
              game: game,
              players: players,
              tiles: tiles,
              cities: cities,
              units: units,
              buildingTypes: buildingTypes,
              unitTypes: unitTypes,
              goldPerTurn: goldPerTurn,
            });
          });
        });
      });
    });
  });
}

module.exports = getData;
