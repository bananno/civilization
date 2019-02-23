/*
Update player production progress:
- Gold & culture go directly into storage for spending during turn.
- Research is applied to the current technology.
- Food & labor are not considered because each city produces them for itself only.
*/

async function updatePlayer(data) {
  const player = data.currentPlayer
  const playerData = {};

  playerData.storage = player.storage;
  playerData.researchProgress = player.researchProgress;

  playerData.storage.gold += player.production.gold;
  playerData.storage.culture += player.production.culture;

  if (player.researchCurrent == null) {
    playerData.storage.science += player.production.science;
    return await player.update(playerData);
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

  await player.update(playerData);
}

module.exports = updatePlayer;
