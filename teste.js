require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const OpenAI = require('openai');
const { Readable, Transform } = require('stream');
const FormData = require('form-data');

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const getAudioFromUrl = async (url) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  // return Buffer.from(response.data, 'binary');
  return response.data;
}

const getAudioFile = (path) => {
  return fs.createReadStream(path);
}


const getAudios = async () => {
  const audio1 = await getAudioFromUrl('https://drive-g.kommo.com/download/db5312af-76e1-5627-8480-08ee664ba18a/173091e5-0ac5-469a-b92d-e4a179517556/d9a7161c-6ca9-4268-8e9b-e4e5c1364bcd/data.m4a');
  const audio2 = getAudioFile('./public/files/aud.mp3');

  return {
    audioBuffer: audio1,
    audioFile: audio2
  }
}

const sendAudioToGpt = async () => {

  try {
    const audio = await getAudios();
    const buffer = Buffer.from(audio.audioBuffer);
    console.log("Buffer: ", buffer);

    const form = new FormData();

    // const readableStream = new Readable();
    // readableStream.push(buffer);
    // readableStream.push(null);

    form.append('file', buffer, {
      filename: 'audio.mp3',
      contentType: 'audio/mpeg',
    });

    console.dir(form, { depth: null });

    const transcriptions = openai.audio.transcriptions.create({
      file: form,
      model: "whisper-1",
    });

    return
  } catch (e) {
    console.error(e);
  }
}

sendAudioToGpt();