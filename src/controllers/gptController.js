require('dotenv').config();
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const OpenAI = require('openai');

const openai = new OpenAI(process.env.OPENAI_API_KEY);

class GptController {
  index(req, res) {
    res.json({message: 'Hello from GPT controller'});
  }

  async generateText(req, res) {
    const { message } = req.body;

    try {
      const { data } = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });

      res.json(data);
    } catch (error) {
      console.error(error);
    }
  }

  async generateAudio(req, res) {
    const { input } = req.body;
    const speechFile = path.resolve("./public/speech.mp3");

    try {
      const mp3 = await openai.audio.speech.create({
        'model': 'tts-1',
        'voice': 'nova',
        'input': input
      });

      console.log(speechFile);
      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.promises.writeFile(speechFile, buffer);
      console.log('File written');
      res.sendFile(speechFile);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = new GptController();