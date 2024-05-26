require('dotenv').config();
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const OpenAI = require('openai');
const LeadThread = require('../models/LeadThread');
const { Op } = require('sequelize');

const openai = new OpenAI(process.env.OPENAI_API_KEY);

class GptController {
  constructor() {
    this.index = this.index.bind(this);
    this.generateText = this.generateText.bind(this);
    this.generateAudio = this.generateAudio.bind(this);
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

      res.json({ response: messages_response.data[0].content[0].text.value });
    } catch (error) {
      console.error(error);
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