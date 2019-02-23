
async function updatePlayer(data) {
  const player = data.currentPlayer
  const playerData = {};

  const completeUpdate = () => {
    player.update(playerData);
  };

  playerData.storage = player.storage;
  playerData.researchProgress = player.researchProgress;

  // gold & culture go directly into storage for spending during turn
  playerData.storage.gold += player.production.gold;
  playerData.storage.culture += player.production.culture;

  // research progress is applied to the current technology
  if (player.researchCurrent == null) {
    playerData.storage.science += player.production.science;
    return completeUpdate();
  }

  const scienceCost = data.technologyList[player.researchCurrent].scienceCost;
  let researchProgress = 0;

  researchProgress += playerData.researchProgress[player.researchCurrent];
  researchProgress += player.production.science;
  researchProgress += player.storage.science;

  if (researchProgress >= scienceCost) {
    playerData.storage.science = researchProgress - scienceCost;
    playerData.technologies = player.technologies;
    playerData.technologies.push(player.researchCurrent);
    playerData.researchCurrent = null;
  } else {
    playerData.storage.science = 0;
    playerData.researchProgress[player.researchCurrent] = researchProgress;
  }

  completeUpdate();
}

module.exports = updatePlayer;
