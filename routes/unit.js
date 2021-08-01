const {
  Player,
  Unit,
} = require('./import');

module.exports = {
  deleteOneUnit,
};

async function deleteOneUnit(req, res) {
  Unit.findById(req.params.id, (error, unit) => {
    if (error) {
      return res.status(500).send(error);
    }
    if (!unit) {
      return res.status(404).send(null);
    }
    Unit.deleteOne({_id: req.params.id}, (error, value) => {
      if (error) {
        return res.status(500).send(error);
      }
      res.send('');
    });
  });
}
