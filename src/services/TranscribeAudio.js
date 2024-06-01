const fs = require("fs");
const openai = require("./AuthenticateOpenAI");

const transcribeAudio = async (fileId) => {
  const file = fs.createReadStream(`./public/files/${fileId}.m4a`);
  const transcription = await openai.audio.transcriptions.create({
    file: file,
    model: 'whisper-1',
  });

  return transcription.text;
};

module.exports = transcribeAudio;