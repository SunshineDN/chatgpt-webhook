const axios = require("axios");
const fs = require("fs");

const downloadAudio = async (file) => {
  const response = await axios.get(file.url, {
    responseType: 'stream'
  });

  const writer = fs.createWriteStream(`./public/files/${file.name}.${file.extension}`);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

const deleteTempFile = async (file) => {
  fs.unlinkSync(`./public/files/${file.name}.${file.extension}`, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Temporary file deleted');
    }
  });
};

module.exports = {
  downloadAudio,
  deleteTempFile
};