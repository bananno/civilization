const express = require('express');
const router = express.Router();
module.exports = router;

const gameRoutes = require('./game');
const playerRoutes = require('./player');
const unitRoutes = require('./unit');

const foundCity = require('./foundCity');
const buyTile = require('./buyTile');
const workTile = require('./workTile');
const endTurn = require('./endTurn');
const newGame = require('./newGame');
const moveUnit = require('./moveUnit');
const projectRoutes = require('./chooseProject');
const chooseResearch = require('./chooseResearch');

router.get('/', gameRoutes.getHomePage);
router.get('/newGame', gameRoutes.newGameGet);
router.get('/loadGame', gameRoutes.loadGameGet);
router.get('/loadGame/:gameId', gameRoutes.loadGamePost);
router.get('/exitGame', gameRoutes.exitGame);
router.post('/zoom', gameRoutes.zoom);

router.post('/buyTile/:cityId/:tileId', buyTile);
router.post('/endTurn', endTurn);
router.post('/newGame', newGame);
router.post('/moveUnit/:unitId/:row/:col', moveUnit);
router.post('/automateProjects/:cityId', projectRoutes.automateProjects);
router.get('/chooseProject/:cityId/:project/:index', projectRoutes.chooseProject);
router.get('/chooseResearch/:index', chooseResearch);

// API
router.post('/foundCity/:unitId', foundCity);
router.post('/workTile/:cityId/:tileId', workTile);
router.get('/games', gameRoutes.getAllGames);
router.get('/game/:id', gameRoutes.getOneGame);
router.get('/player/:id', playerRoutes.getOnePlayer);
router.get('/player/:id/units', playerRoutes.getPlayerUnits);
router.get('/empireProduction', playerRoutes.getEmpireProduction);
router.delete('/unit/:id', unitRoutes.deleteOneUnit);
router.get('/unit/:id/status', unitRoutes.getStatus);
router.post('/unit/:id/orders/:action', unitRoutes.postGiveOrders);
