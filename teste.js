require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const OpenAI = require('openai');

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const downloadAudio = async (url, fileId) => {
  const response = await axios.get(url, {
    responseType: 'stream'
  });

  const writer = fs.createWriteStream(`./public/files/${fileId}.m4a`);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

const deleteTempFile = async (fileId) => {
  fs.unlinkSync(`./public/files/${fileId}.m4a`, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Temporary file deleted');
    }
  });
};

const transcribeAudio = async (fileId) => {
  const file = fs.createReadStream(`./public/files/${fileId}.m4a`);
  const transcription = await openai.audio.transcriptions.create({
    file: file,
    model: 'whisper-1',
  });

  return transcription.text;
}

const main = async () => {
  try {
    console.log('Starting...');
    console.log('Downloading audio...');
    const audio = await downloadAudio('https://drive-g.kommo.com/download/db5312af-76e1-5627-8480-08ee664ba18a/173091e5-0ac5-469a-b92d-e4a179517556/d9a7161c-6ca9-4268-8e9b-e4e5c1364bcd/data.m4a', 123123);

    console.log('Transcribing audio...');
    const transcription = await transcribeAudio(123123);

    console.log('Transcription:', transcription);

    console.log('Deleting temporary file...');
    await deleteTempFile(123123);

    console.log('Done');
    return
  } catch (e) {
    console.error(e);
  }
}

const data = {
  teste: 1,
  oi: {
    teste: 2,
    teste3: null,
  }
}

data.oi.teste3 = 3;
console.log(data)
// main();