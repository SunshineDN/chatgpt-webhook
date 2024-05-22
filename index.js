const express = require('express');
const gptRoute = require('./src/routes/gptRoute');
const bdRoute = require('./src/routes/bdRoute');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use('/gpt', gptRoute);
app.use('/bd', bdRoute);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});