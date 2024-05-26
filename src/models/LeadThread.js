require('dotenv').config();
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // ajuste o caminho para o seu arquivo de configuração do Sequelize

const LeadThread = sequelize.define('LeadThread', {
  leadID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  threadID: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  assistant_id: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  }
}, {
  tableName: process.env.TABLE_NAME, // nome da tabela no banco de dados
});

module.exports = LeadThread;
