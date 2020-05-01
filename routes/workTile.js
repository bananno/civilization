const {
  express,
  getData,
  workTile,
} = require('./import');

const router = express.Router();

router.post('/workTile/:cityId/:tileId', (req, res, next) => {
  const cityId = req.params.cityId;
  const tileId = req.params.tileId;

  getData(req, res, next, (data) => {
    const city = data.cityRef[cityId];
    const tile = data.tileRef[tileId]

    if (city == null || tile == null
        || !data.help.isCurrentPlayer(city.player)
        || !data.help.isCurrentPlayer(tile.player)) {
      console.log('Invalid city/tile action.');
      return res.redirect('/');
    }

    const alreadyWorkingTile = '' + tile.worked == '' + city._id;

    if (alreadyWorkingTile) {
      workTile.update(null, tile);
    } else {
      const cityTilesWorked = data.tiles.filter(nextTile => {
        return '' + nextTile.worked == '' + city._id;
      });

      if (cityTilesWorked.length >= city.population + 1) {
        console.log('All citizens are already employed at other tiles.');
        return res.redirect('/');
      }

      const tileOutput =  data.help.getTileTotalProduction(tile);

      if (tileOutput == 0) {
        console.log('Cannot work tiles with 0 production value.');
        return res.redirect('/');
      }

      workTile.update(city, tile);
    }

    res.redirect('/');
  });
});

module.exports = router;
