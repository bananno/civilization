const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.post('/buyTile/:cityId/:tileId', (req, res, next) => {
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

    claimTile(data, city, tile);

    res.redirect('/');
  });
});

async function claimTile(data, city, tile) {
  const playerUpdate = {};

  playerUpdate.storage = data.currentPlayer.storage;
  playerUpdate.storage.gold -= 10;

  await data.currentPlayer.update(playerUpdate);

  const tileUpdate = {
    player: data.currentPlayer,
  };

  await tile.update(tileUpdate);
}

module.exports = router;
