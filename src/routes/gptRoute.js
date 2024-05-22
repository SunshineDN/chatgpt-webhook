const express = require('express');
const GptController = require('../controllers/gptController');
const gptRoute = express.Router();

gptRoute.get('/', GptController.index);

gptRoute.post('/text', GptController.generateText);

gptRoute.post('/audio', GptController.generateAudio);

module.exports = gptRoute;