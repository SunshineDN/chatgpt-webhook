const express = require('express');
const BdController = require('../controllers/bdController');
const bdRoute = express.Router();

bdRoute.get('/', BdController.index);

module.exports = bdRoute;