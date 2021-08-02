const {
  Player,
  Session,
  Unit,
} = require('./import');

module.exports = {
  deleteOneUnit,
};

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
    Unit.deleteOne({_id: req.params.id}, (error, value) => {
      if (error) {
        return res.status(500).send(error);
      }
      res.send('');
    });
  });
}
