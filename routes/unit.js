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
  postGiveOrders,
};

const unitOrdersActionMap = {
  automate: {automate: true, value: null, workerOnly: true},
  cancel: {value: null},
  skip: {value: UNIT_ORDERS.SKIP_TURN},
  sleep: {value: UNIT_ORDERS.SLEEP},
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

async function postGiveOrders(req, res) {
  const currentGameId = Session.getCurrentGameId(req);
  if (!currentGameId) {
    return res.status(401).send('no active game');
  }

  const [unit, unitErrorCode, unitErrorInfo] = await getUnitIfValid(req.params.id, currentGameId);
  if (!unit) {
    return res.status(unitErrorCode).send(unitErrorInfo);
  }

  const action = req.params.action;

  const newOrdersInfo = unitOrdersActionMap[action];

  if (newOrdersInfo.workerOnly && unit.templateName !== 'worker') {
    return res.status(403).send('wrong unit type');
  }

  const errorOnUpdate = await updateUnitOrders(unit, newOrdersInfo.value, newOrdersInfo.automate);

  if (errorOnUpdate) {
    res.status(500).send(errorOnUpdate);
  } else {
    res.send('');
  }
}

// HELPERS

async function getUnitIfValid(unitId, gameId) {
  try {
    const unit = await Unit.findOne({_id: unitId, game: gameId});
    if (!unit) {
      return [null, 404, 'unit not found'];
    }
    const belongsToActiveUser = await Unit.belongsToActiveUser(unit);
    if (!belongsToActiveUser) {
      return [null, 401, 'belongs to wrong user'];
    }
    return [unit];
  } catch (error) {
    return [null, 500, {...error}];
  }
}

async function updateUnitOrders(unit, newOrdersValue, automate) {
  const updates = {
    orders: newOrdersValue || null,
    automate: automate || false,
  };
  try {
    await Unit.updateOne({_id: unit._id}, updates);
    return null;
  } catch (error) {
    return {...error};
  }
}
