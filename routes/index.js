const express = require('express');
const router = express.Router();

const Game = require('../models/game');
const Player = require('../models/player');
const Unit = require('../models/unit');

router.get('/', getHomePage);
router.post('/endTurn', endTurn);
router.post('/moveUnit/:unitId/:row/:col', moveUnit);

function withCurrentGame(req, res, next, callback) {
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
      Unit.find({ game: game }, (error, units) => {
        if (error) {
          return next(error);
        }
        callback({
          game: game,
          players: players,
          units: units,
        });
      });
    });
  });
}

function getHomePage(req, res, next) {
  withCurrentGame(req, res, next, (data) => {
    res.render('index', data);
  });
}

function endTurn(req, res, next) {
  withCurrentGame(req, res, next, (data) => {
    let gameData = {};
    let resetMoves = false;
    if (data.game.nextPlayer < data.players.length - 1) {
      gameData.nextPlayer = data.game.nextPlayer + 1;
    } else {
      gameData.nextPlayer = 0;
      gameData.turn = data.game.turn + 1;
      resetMoves = true;
    }
    data.game.update(gameData, (error, game) => {
      if (error) {
        return next(error);
      }
      if (resetMoves) {
        Unit.updateMany(data.units, { movesRemaining: 1 }, (error, units) => {
          res.redirect('/');
        });
      } else {
        res.redirect('/');
      }
    })
  });
}

function moveUnit(req, res, next) {
  let unitId = req.params.unitId;
  let newRow = parseInt(req.params.row);
  let newCol = parseInt(req.params.col);

  withCurrentGame(req, res, next, (data) => {
    Unit.findById(unitId, (error, unit) => {
      if (error) {
        return next(error);
      }

      let oldRow = unit.location[0];
      let oldCol = unit.location[1];
      let unitData = {};

      let legalMove = (() => {
        if (unit.movesRemaining == 0) {
          return false;
        }

        if (newRow < 0 || newCol >= 10) {
          return false;
        }

        if (newRow != oldRow && newCol != oldCol) {
          return false;
        }

        let wrapColumn = (oldCol == 0 && newCol == 9) || (oldCol == 9 && newCol == 0);
        let oneColAway = Math.abs(oldCol - newCol) == 1 || wrapColumn;
        let oneRowAway = Math.abs(oldRow - newRow) == 1;

        if (!(oneColAway || wrapColumn) && !oneRowAway) {
          return false;
        }

        let unitsInNewSpace = data.units.filter(otherUnit => {
          return otherUnit.location[0] == newRow
            && otherUnit.location[1] == newCol;
        });

        if (unitsInNewSpace.length) {
          return false;
        }

        return true;
      })();

      if (legalMove) {
        unitData.location = [newRow, newCol];
        unitData.movesRemaining = unit.movesRemaining - 1;
      }

      unit.update(unitData, (error, unit) => {
        if (error) {
          return next(error);
        }
        res.redirect('/');
      });
    });
  });
}

module.exports = router;
