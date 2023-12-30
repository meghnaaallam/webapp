//Sequelize
const { Sequelize } = require('sequelize');

// connecting sequelize and PGAdmin
const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
    host: process.env.HOST,
    dialect: "postgres"
  });


  
module.exports = sequelize;