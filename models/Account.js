const { Sequelize} = require('sequelize');
const sequelizeDB = require('../dbConnect/sequelizeConnect');



const Account = sequelizeDB.define('accounts', {
    id: {
        type: Sequelize.UUID, // Use DataTypes.UUID for UUIDs
        defaultValue: Sequelize.UUIDV4,
        primaryKey:true,
        allowNull: false
    },
    firstName: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false
    },
    lastName: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        required: true
  },
  email: {
      type: Sequelize.STRING,
      unique: true,
      required: true
  },
  account_created: {
    type: 'TIMESTAMP',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    allowNull: false,
},
account_updated: {
    type: 'TIMESTAMP',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    allowNull: false,
}
});

module.exports = Account;