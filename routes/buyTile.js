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

    console.log('BUY TILE');

    res.redirect('/');
  });
});

module.exports = router;
