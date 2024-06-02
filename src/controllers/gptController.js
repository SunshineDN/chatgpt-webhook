require('dotenv').config();
const axios = require('axios');
const OpenAI = require('openai');
const { downloadAudio, deleteTempFile } = require('../services/DaD-Audio');
const LeadThread = require('../models/LeadThread');
const { Op } = require('sequelize');
const transcribeAudio = require('../services/TranscribeAudio');
const getFileNameFromUrl = require('../utils/GetNameExtension');

const openai = new OpenAI(process.env.OPENAI_API_KEY);

class GptController {
  constructor() {
    this.index = this.index.bind(this);
    this.generateText = this.generateText.bind(this);
    this.textToAudio = this.textToAudio.bind(this);
    this.audioToText = this.audioToText.bind(this);
    this.createThread = this.createThread.bind(this);
    this.generateMessage = this.generateMessage.bind(this);
  }

  index(req, res) {
    res.json({ message: 'Hello from GPT controller' });
  }

  async createThread(leadID, assistant_id) {
    try {
      const existThreads = await LeadThread?.findOne({
        where: {
          leadID
        }
      });

      if (!existThreads) {
        console.log("Creating thread for lead in database for first time".magenta.bold);
        await LeadThread.create({
          leadID
        });
        const newThread = await openai.beta.threads.create({
          metadata: {
            user: leadID.toString()
          }
        });
        console.log("Thread created in OpenAI for first time".magenta.bold);
        console.log(newThread);

        console.log("Updating threadID in database for first time".magenta.bold);
        await LeadThread.update({
          threadID: [newThread.id],
          assistant_id: [assistant_id]
        }, {
          where: {
            leadID
          }
        });
        console.log("ThreadID updated in database for first time".magenta.bold);
        return;
      } else {
        console.log("Thread already exists in database".magenta.bold)
        const newThread = await openai.beta.threads.create({
          metadata: {
            user: leadID.toString()
          }
        });
        console.log("Thread created in OpenAI".magenta.bold);
        console.log(newThread);

        console.log("Updating threadID in database".magenta.bold);
        let newArrayAssistans = existThreads.assistant_id;
        let newArrayThreads = existThreads.threadID;

        await LeadThread.update({
          threadID: [...newArrayThreads, newThread.id],
          assistant_id: [...newArrayAssistans, assistant_id]
        }, {
          where: {
            leadID
          }
        });
        console.log("Assistant added to thread".magenta.bold)
        return;
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async generateMessage(req, res) {
    const { text, leadID } = req.body;
    const { assistant_id } = req.params;

    const { decode } = require('base-64');

    console.log('Texto recebido do usuário:'.magenta.bold, text);

    const assistant = decode(assistant_id);

    try {
      let existThreads = await LeadThread?.findOne({
        where: {
          leadID,
          assistant_id: {
            [Op.contains]: [assistant]
          }
        }
      });

      if (!existThreads) {
        await this.createThread(leadID, assistant);
        existThreads = await LeadThread.findOne({
          where: {
            leadID,
            assistant_id: {
              [Op.contains]: [assistant]
            }
          }
        });
      }

      console.log('Thread found'.magenta.bold)
      console.log(existThreads.dataValues);

      const indexOfAssistant = existThreads.assistant_id.indexOf(assistant);
      console.log('Index of assistant'.magenta.bold, indexOfAssistant);

      console.log('Sending message to assistant'.magenta.bold);
      await openai.beta.threads.messages.create(
        existThreads.threadID[indexOfAssistant],
        {
          role: 'user',
          content: text
        }
      );

      console.log('Running assistant'.magenta.bold);
      let run = await openai.beta.threads.runs.create(
        existThreads.threadID[indexOfAssistant],
        { assistant_id: assistant }
      );

      while (run.status !== 'completed') {
        run = await openai.beta.threads.runs.retrieve(
          existThreads.threadID[indexOfAssistant],
          run.id
        );
        console.log('Run status:'.yellow.bold, run.status)
        setTimeout(() => { }, 2000)
      }
      const messages_response = await openai.beta.threads.messages.list(
        existThreads.threadID[indexOfAssistant]
      );

      res.json({ message: messages_response.data[0].content[0].text.value });
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  }

  async promptMessage(req, res) {
    const { text } = req.body;

    try {
      const completions = await openai.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: text
          }
        ],
        model: 'gpt-3.5-turbo-1106'
      })

      res.json({ message: completions.choices[0].message.content });
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  }

  async listMessages(req, res) {
    const { leadID } = req.params;

    try {
      const existThreads = await LeadThread?.findOne({
        where: {
          leadID
        }
      });

      if (!existThreads) {
        return res.json({ message: 'Thread not found' });
      }

      const messages = await openai.beta.threads.messages.list(
        existThreads.threadID
      );

      res.json(messages);
    } catch (error) {
      console.error(error);
      res.json({ message: 'Error' });
    }
  }

  async deleteThread(req, res) {
    const { leadID } = req.params;

    try {
      const existThreads = await LeadThread?.findOne({
        where: {
          leadID
        }
      });

      if (!existThreads) {
        return res.json({ message: 'Thread not found' });
      }

      await openai.beta.threads.del(existThreads.threadID);
      await LeadThread.destroy({
        where: {
          leadID
        }
      });

      res.json({ message: 'Thread deleted' });
    } catch (error) {
      console.error(error);
    }
  }

  async audioToText(req, res) {
    const { audio_link, lead_id } = req.body;

    if (!audio_link || !lead_id) return res.status(400).json({ message: 'Missing parameters' });

    const fileObj = getFileNameFromUrl(audio_link, lead_id);

    try {
      console.log('Downloading audio...'.magenta.bold);
      await downloadAudio(fileObj);
      console.log('Success\n'.green.bold);

      console.log('Transcribing audio...'.magenta.bold);
      const transcription = await transcribeAudio(fileObj);
      console.log('Success\n'.green.bold);

      console.log('Deleting temporary file...'.magenta.bold);
      await deleteTempFile(fileObj);
      console.log('Success\n'.green.bold);

      res.json({ message: transcription });
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  }

  async textToAudio(req, res) {
    const { message, phone } = req.body;

    if(!message || !phone) return res.status(400).json({ message: 'Missing parameters' });

    const URL = "https://new-api.zapsterapi.com/v1/wa/messages";
    const headers = {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_KEY_ZAPSTER}`
    };
    const data = {
      media: {ptt: true, base64: null},
      instance_id: process.env.INSTANCE_ID_ZAPSTER,
      recipient: phone
    };

    try {
      const mp3 = await openai.audio.speech.create({
        'model': 'tts-1',
        'voice': 'nova',
        'input': message
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      data.media.base64 = buffer.toString('base64');

      await axios.post(URL, data, { headers });
      res.json({ message: 'Audio sent' });
    } catch (error) {
      console.error("Error", error.message);
      res.status(500).json(error);
    }
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
}

module.exports = new GptController();