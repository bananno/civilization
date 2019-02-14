const express = require('express');
const router = express.Router();
const getData = require('./getData');

router.post('/workTile/:cityId/:tileId', (req, res, next) => {
  let cityId = req.params.cityId;
  let tileId = req.params.tileId;

  getData(req, res, next, (data) => {
    let city = data.cityRef[cityId];

    let tile = data.tiles.filter(tile => {
      return tile._id == tileId;
    })[0];

    if (city == null || tile == null
        || ('' + city.player != '' + data.turnPlayerId)
        || ('' + tile.player != '' + data.turnPlayerId)) {
      console.log('Invalid city/tile action.');
      return res.redirect('/');
    }

    let tileData = {};

    let alreadyWorkingTile = '' + tile.worked == '' + city._id;

    if (alreadyWorkingTile) {
      tileData.worked = null;
    } else {
      let cityTilesWorked = data.tiles.filter(nextTile => {
        return '' + nextTile.worked == '' + city._id;
      });

      if (cityTilesWorked.length >= city.population + 1) {
        console.log('All citizens are already employed at other tiles.');
        return res.redirect('/');
      }

      let tileOutput = 0;

      ['gold', 'food', 'labor', 'culture', 'science'].forEach(prod => {
        tileOutput += tile.production[prod];
      });

      if (tileOutput == 0) {
        console.log('Cannot work tiles with 0 production value.');
        return res.redirect('/');
      }

      tileData.worked = city;
    }

    tile.update(tileData, error => {
      if (error) {
        return next(error);
      }
      res.redirect('/');
    });
  });
});

module.exports = router;
