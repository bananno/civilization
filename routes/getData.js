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
            let cityOutput = {};

            players.forEach(player => {
              goldPerTurn[player._id] = 0;
            });

            // Initialize city output; calculate output from each city's buildings.
            cities.forEach(city => {
              cityOutput[city._id] = {
                gold: 0,
                food: 0,
                production: 0,
              };

              city.buildings.forEach(i => {
                output.gold += buildingTypes[i].gold;
                output.food += buildingTypes[i].food;
                output.production += buildingTypes[i].production;
              });
            });

            // Calculate output of all tiles that are worked by a city.
            tiles.forEach(tile => {
              if (tile.worked) {
                output[tile.worked].gold += tile.gold;
                output[tile.worked].food += tile.food;
                output[tile.worked].production += tile.production || 0;
              }
            });

            // Calculate each player's gold per turn as the sum of all cities' gold.
            cities.forEach(city => {
              goldPerTurn[city.player] += cityOutput[city._id].gold;

              if (city.project.category == 'gold') {
                let cityProduction = cityOutput[city._id].production;
                goldPerTurn[city.player] += Math.floor(cityProduction / 2);
              }
            });

            let turnPlayerId = players[game.nextPlayer]._id;

            callback({
              game: game,
              players: players,
              tiles: tiles,
              cities: cities,
              units: units,
              buildingTypes: buildingTypes,
              unitTypes: unitTypes,
              goldPerTurn: goldPerTurn,
              cityOutput: cityOutput,
              turnPlayerId: turnPlayerId,
            });
          });
        });
      });
    });
  });
}

module.exports = getData;
