const chooseAutoResearch = require('../support/chooseAutoResearch');

/*
Update player production progress:
- Gold & culture go directly into storage for spending during turn.
- Research is applied to the current technology.
- Food & labor are not considered because each city produces them for itself only.
*/

function updatePlayer(data) {
  const player = data.currentPlayer;
  const playerData = {};

  const completeUpdate = async () => {
    await player.update(playerData);
  };

  playerData.storage = player.storage;
  playerData.researchProgress = player.researchProgress;

  playerData.storage.gold += player.production.gold;
  playerData.storage.culture += player.production.culture;

  if (player.researchCurrent == null) {
    playerData.storage.science += player.production.science;
    return completeUpdate();
  }

  const scienceCost = data.technologyList[player.researchCurrent].scienceCost;
  let researchProgress = 0;

  researchProgress += playerData.researchProgress[player.researchCurrent];
  researchProgress += player.production.science;
  researchProgress += player.storage.science;

  if (researchProgress < scienceCost) {
    playerData.storage.science = 0;
    playerData.researchProgress[player.researchCurrent] = researchProgress;
    return completeUpdate();
  }

  playerData.storage.science = researchProgress - scienceCost;
  playerData.technologies = player.technologies;
  playerData.technologies.push(player.researchCurrent);

  if (player.researchAutomate) {
    let index = chooseAutoResearch(data);
    playerData.researchCurrent = index;
    if (index) {
      playerData.researchProgress = data.currentPlayer.researchProgress;
      playerData.researchProgress[index] = playerData.researchProgress[index] || 0;
      playerData.researchProgress[index] += playerData.storage.science;
      playerData.storage.science = 0;
    }
  } else {
    playerData.researchCurrent = null;
  }

  completeUpdate();
}

module.exports = updatePlayer;
