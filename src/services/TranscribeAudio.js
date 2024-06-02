const fs = require("fs");
const openai = require("./AuthenticateOpenAI");

const transcribeAudio = async (fileObj) => {
  const file = fs.createReadStream(`./public/files/${fileObj.name}.${fileObj.extension}`);
  const transcription = await openai.audio.transcriptions.create({
    file: file,
    model: 'whisper-1',
  });

  return transcription.text;
};

module.exports = transcribeAudio;