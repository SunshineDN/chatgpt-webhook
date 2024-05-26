const express = require('express');
const BdController = require('../controllers/bdController');
const bdRoute = express.Router();

bdRoute.get('/', BdController.index);

bdRoute.get('/list', BdController.list);

bdRoute.delete('/drop', BdController.dropTable);

bdRoute.delete('/thread/:threadID', BdController.deleteThread);

module.exports = bdRoute;