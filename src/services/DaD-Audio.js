const axios = require("axios");
const fs = require("fs");

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

module.exports = {
  downloadAudio,
  deleteTempFile
};