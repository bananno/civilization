
function automaticallyChooseTile(data, city) {
}

async function claimGivenTile(data, tile) {
  await tile.update({
    player: data.currentPlayer,
  });
}

module.exports = {
  auto: automaticallyChooseTile,
  claim: claimGivenTile,
};
