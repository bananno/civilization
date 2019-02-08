const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.post('/workTile/:cityId/:tileId', (req, res, next) => {
  let cityId = req.params.cityId;
  let tileId = req.params.tileId;

  getData(req, res, next, (data) => {
    let city = data.cities.filter(city => {
      return city._id == cityId;
    })[0];

    let tile = data.tiles.filter(tile => {
      return tile._id == tileId;
    })[0];

    let turnPlayerId = '' + data.players[data.game.nextPlayer]._id;

    if ('' + city.player != turnPlayerId || '' + tile.player != turnPlayerId) {
      console.log('Invalid city/tile action.');
      return res.redirect('/');
    }

    let cityTilesWorked = data.tiles.filter(tile => {
      return tile.worked == city._id;
    });

    if (cityTilesWorked.length >= city.population) {
      console.log('All citizens are already employed at other tiles.');
      return res.redirect('/');
    }

    console.log('WORK TILE');
    console.log(cityId);
    console.log(tileId);

    res.redirect('/');

  });
});

module.exports = router;
