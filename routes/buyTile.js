const {
  getData,
  claimTile,
} = require('./import');

module.exports = buyTilePost;

function buyTilePost(req, res, next) {
  const cityId = req.params.cityId;
  const tileId = req.params.tileId;

  getData(req, res, next, (data) => {
    const city = data.cityRef[cityId];
    const tile = data.tileRef[tileId];

    if (city == null || tile == null || tile.player != null
        || !data.help.isCurrentPlayer(city.player)) {
      console.log('Invalid city/tile action.');
      return res.redirect('/');
    }

    if (data.currentPlayer.storage.gold < 10) {
      console.log('Cannot afford to buy tile.');
      return res.redirect('/');
    }

    buyTile(data, tile);

    res.redirect('/');
  });
}

async function buyTile(data, tile) {
  const playerUpdate = {};

  playerUpdate.storage = data.currentPlayer.storage;
  playerUpdate.storage.gold -= 10;

  await data.currentPlayer.update(playerUpdate);

  await claimTile.claim(data, tile);

  data.help.forEachAdjacentTile(tile.location, tile => {
    (async () => {
      const tileUpdate = {};
      tileUpdate.discovered = tile.discovered;
      tileUpdate.discovered.push(data.currentPlayer);
      await tile.update(tileUpdate);
    })();
  });
}
