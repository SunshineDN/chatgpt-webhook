const express = require('express');
const GptController = require('../controllers/gptController');
const gptRoute = express.Router();

gptRoute.get('/', GptController.index);

gptRoute.post('/text', GptController.generateText);

gptRoute.post('/audio-to-text', GptController.audioToText);

gptRoute.post('/text-to-audio', GptController.textToAudio);

gptRoute.delete('/thread/:leadID', GptController.deleteThread);

gptRoute.post('/:assistant_id/message', GptController.generateMessage);

gptRoute.post('/message', GptController.promptMessage);

gptRoute.get('/:leadID/message/list', GptController.listMessages);

module.exports = gptRoute;