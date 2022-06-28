const {
  Player,
  Session,
  Tile,
  Unit,
  UNIT_ORDERS,
} = require('./import');

module.exports = {
  deleteOneUnit,
  getStatus,
  orders: {
    cancel: cancelOrders,
    skip: orderToSkipTurn,
    sleep: orderToSleep,
  },
};

async function getStatus(req, res) {
  const currentGameId = Session.getCurrentGameId(req);
  let unit;

  try {
    const unit = await Unit.findOne({_id: req.params.id, game: currentGameId});

    if (!unit) {
      return res.status(404).send('unit not found');
    }

    const belongsToActiveUser = await Unit.belongsToActiveUser(unit);
    if (!belongsToActiveUser) {
      return res.status(401).send('belongs to wrong user');
    }

    const unitData = {
      automate: unit.automate,
      id: unit._id,
      location: unit.location,
      moves: unit.moves,
      movesRemaining: unit.movesRemaining,
      orders: unit.orders,
      templateName: unit.templateName,
    };

    if (unitData.templateName === 'settler') {
      const tile = await Tile.findOne({game: currentGameId, location: unit.location});
      unitData.canFoundCity = tile.improvement !== 'city' &&
        (!tile.player || `${tile.player}` === `${unit.player}`);
    }

    res.send(unitData);
  } catch (err) {
    return res.status(500).send({...err});
  }
}

async function cancelOrders(req, res) {
  const currentGameId = Session.getCurrentGameId(req);
  if (!currentGameId) {
    return res.status(401).send('no active game');
  }
  Unit.findOne({_id: req.params.id, game: currentGameId}, async (error, unit) => {
    if (error) {
      return res.status(500).send(error);
    }
    if (!unit) {
      return res.status(404).send('unit not found');
    }
    if (!unit.orders) {
      return res.send('unit already has no orders');
    }
    const belongsToActiveUser = await Unit.belongsToActiveUser(unit);
    if (!belongsToActiveUser) {
      return res.status(401).send('belongs to wrong user');
    }
    Unit.updateOne({_id: req.params.id}, {orders: null}, error => {
      if (error) {
        return res.status(500).send(error);
      }
      res.send('');
    });
  });
}

async function deleteOneUnit(req, res) {
  const currentGameId = Session.getCurrentGameId(req);
  if (!currentGameId) {
    return res.status(401).send('no active game');
  }
  Unit.findOne({_id: req.params.id, game: currentGameId}, async (error, unit) => {
    if (error) {
      return res.status(500).send(error);
    }
    if (!unit) {
      return res.status(404).send('unit not found');
    }
    if (unit.movesRemaining === 0) {
      return res.status(401).send('unit has no moves remaining');
    }
    const belongsToActiveUser = await Unit.belongsToActiveUser(unit);
    if (!belongsToActiveUser) {
      return res.status(401).send('belongs to wrong user');
    }
    Unit.deleteOne({_id: req.params.id}, error => {
      if (error) {
        return res.status(500).send(error);
      }
      res.send('');
    });
  });
}

async function orderToSkipTurn(req, res) {
  const currentGameId = Session.getCurrentGameId(req);
  if (!currentGameId) {
    return res.status(401).send('no active game');
  }
  Unit.findOne({_id: req.params.id, game: currentGameId}, async (error, unit) => {
    if (error) {
      return res.status(500).send(error);
    }
    if (!unit) {
      return res.status(404).send('unit not found');
    }
    if (unit.movesRemaining === 0) {
      return res.send('unit already out of moves');
    }
    if (unit.orders === UNIT_ORDERS.SKIP_TURN) {
      return res.send('unit already set to skip turn');
    }
    const belongsToActiveUser = await Unit.belongsToActiveUser(unit);
    if (!belongsToActiveUser) {
      return res.status(401).send('belongs to wrong user');
    }
    Unit.updateOne({_id: req.params.id}, {orders: UNIT_ORDERS.SKIP_TURN}, error => {
      if (error) {
        return res.status(500).send(error);
      }
      res.send('');
    });
  });
}

async function orderToSleep(req, res) {
  const currentGameId = Session.getCurrentGameId(req);
  if (!currentGameId) {
    return res.status(401).send('no active game');
  }
  Unit.findOne({_id: req.params.id, game: currentGameId}, async (error, unit) => {
    if (error) {
      return res.status(500).send(error);
    }
    if (!unit) {
      return res.status(404).send('unit not found');
    }
    if (unit.orders === UNIT_ORDERS.SLEEP) {
      return res.send('unit already sleeping');
    }
    const belongsToActiveUser = await Unit.belongsToActiveUser(unit);
    if (!belongsToActiveUser) {
      return res.status(401).send('belongs to wrong user');
    }
    Unit.updateOne({_id: req.params.id}, {orders: UNIT_ORDERS.SLEEP}, error => {
      if (error) {
        return res.status(500).send(error);
      }
      res.send('');
    });
  });
}
