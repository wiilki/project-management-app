const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.JAWSDB_URL || {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.JAWSDB_URL ? undefined : 'localhost',
  dialect: 'mysql',
  port: 3306,
});

module.exports = sequelize;
