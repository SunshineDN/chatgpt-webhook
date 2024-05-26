const express = require('express');
const gptRoute = require('./src/routes/gptRoute');
const bdRoute = require('./src/routes/bdRoute');
const bodyParser = require('body-parser');
const sequelize = require('./src/config/database');
const cors = require('cors');

const colors = require('colors');
colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red',
  attention: 'bgBlue'
});

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/gpt', gptRoute);
app.use('/bd', bdRoute);


app.listen(3000, async () => {
  await sequelize.authenticate()
  .then(() => {
    console.log('Conexão estabelecida com sucesso!'.attention);
  })
  await sequelize.sync()
  .then(() => {
    console.log('Tabelas sincronizadas com sucesso!'.attention);
  })
  .catch((error) => {
    console.error('Erro ao sincronizar tabelas:', error);
  });
  console.log('\nServer is running on port 3000'.debug.bold);
  // console.log('\x1b[35m'+'Server is running on port 3000')
});