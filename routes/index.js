const express = require('express');
const router = express.Router();
module.exports = router;

const gameRoutes = require('./game');
const foundCity = require('./foundCity');
const buyTile = require('./buyTile');
const workTile = require('./workTile');
const endTurn = require('./endTurn');
const newGame = require('./newGame');
const moveUnit = require('./moveUnit');
const projectRoutes = require('./chooseProject');
const chooseResearch = require('./chooseResearch');
const unitOrders = require('./unitOrders');
const deleteUnit = require('./deleteUnit');

router.get('/', gameRoutes.getHomePage);
router.get('/newGame', gameRoutes.newGameGet);
router.get('/loadGame', gameRoutes.loadGameGet);
router.get('/loadGame/:gameId', gameRoutes.loadGamePost);
router.get('/exitGame', gameRoutes.exitGame);
router.post('/zoom', gameRoutes.zoom);

router.post('/foundCity/:unitId', foundCity);
router.post('/buyTile/:cityId/:tileId', buyTile);
router.post('/workTile/:cityId/:tileId', workTile);
router.post('/endTurn', endTurn);
router.post('/newGame', newGame);
router.post('/moveUnit/:unitId/:row/:col', moveUnit);
router.post('/automateProjects/:cityId', projectRoutes.automateProjects);
router.get('/chooseProject/:cityId/:project/:index', projectRoutes.chooseProject);
router.get('/chooseResearch/:index', chooseResearch);
router.post('/unitOrders/:orders/:unitId', unitOrders);
router.post('/deleteUnit/:unitId', deleteUnit);
