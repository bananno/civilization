const {
  City,
  Player,
  Session,
  Unit,
} = require('./import');

module.exports = {
  getEmpireProduction,
  getOnePlayer,
  getPlayerUnits,
};

// Get the non-city-specific production (gold, culture, science) for the active player.
// Get the amounts in storage and the income for each turn.
async function getEmpireProduction(req, res) {
  const currentGameId = Session.getCurrentGameId(req);
  if (!currentGameId) {
    return res.status(401).send('no active game');
  }
  const player = await Player.getActivePlayer(currentGameId);
  const cities = await City.find({player});

  const empireProduction = {
    culture: {income: 0, storage: player.storage.culture},
    gold: {income: 0, storage: player.storage.gold},
    science: {income: 0, storage: player.storage.science},
  };

  for (let i in cities) {
    const cityProduction = await cities[i].getTotalProduction();
    empireProduction.culture.income += cityProduction.culture;
    empireProduction.gold.income += cityProduction.gold;
    empireProduction.science.income += cityProduction.science;
  }

  res.send(empireProduction);
}

function getOnePlayer(req, res) {
  Player.findById(req.params.id, async (error, player) => {
    if (error) {
      return res.send(error);
    }
    if (!player) {
      return res.status(404).send(null);
    }
    const result = {
      id: player._id,
      storage: player.storage,
      technologies: player.technologies,
      name: player.name,
      researchAutomate: player.researchAutomate,
      researchCurrent: player.researchCurrent,
      researchProgress: player.researchProgress,
    };
    if (req.query.units) {
      result.units = await Unit.find({player});
    }
    res.send(result);
  });
}

function getPlayerUnits(req, res) {
  Unit.find({player: req.params.id}, async (error, units) => {
    if (error) {
      return res.send(error);
    }
    res.send(units);
  });
}
