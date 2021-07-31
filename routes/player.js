const {
  Player,
  Unit,
} = require('./import');

module.exports = {
  getOnePlayer,
  getPlayerUnits,
};

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
