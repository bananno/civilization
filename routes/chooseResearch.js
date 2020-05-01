const {
  getData,
  chooseAutoResearch,
} = require('./import');

module.exports = chooseResearch;

function chooseResearch(req, res, next) {
  getData(req, res, next, (data) => {
    let index = req.params.index;
    const playerData = {};

    if (index == 'automate') {
      playerData.researchAutomate = !data.currentPlayer.researchAutomate;
      index = playerData.researchAutomate ? chooseAutoResearch(data) : null;
    } else {
      index = parseInt(req.params.index);
      const technology = data.technologyList[index];

      playerData.researchAutomate = false;

      if (!technology.isAvailable) {
        console.log('Technology is not available.');
        return res.redirect('/');
      }
    }

    if (index != null) {
      playerData.researchCurrent = index;
      playerData.researchProgress = data.currentPlayer.researchProgress;
      playerData.researchProgress[index] = playerData.researchProgress[index] || 0;
    }

    data.currentPlayer.update(playerData, error => {
      if (error) {
        return next(error);
      }
      res.redirect('/');
    });
  });
}
