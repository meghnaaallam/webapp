const { Sequelize} = require('sequelize');
const sequelizeDB = require('../dbConnect/sequelizeConnect');
const AccountModel = require('./Account');



const Assignment = sequelizeDB.define('assignments', {
    id: {
        type: Sequelize.UUID, // Use DataTypes.UUID for UUIDs
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false
    },
    points: {
      type: Sequelize.INTEGER,
      required: true,
        defaultValue: 0,
                validate: {
                    min: 1,
                    max: 10
                },
                allowNull: false,
    },
    num_of_attempts: {
        type: Sequelize.INTEGER,
        required: true,
        defaultValue: 0,
        validate: {
            min: 1,
          max: 100
               },
                allowNull: false,
  },
  deadline: {
      type: 'TIMESTAMP',
      required: true,
      allowNull: false
  },
  assignment_created: {
    type: 'TIMESTAMP',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    allowNull: false,
},
assignment_updated: {
    type: 'TIMESTAMP',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    allowNull: false,
}
},
{
    updatedAt: 'assignment_created',
    createdAt: 'assignment_updated',
},
{
    initialAutoIncrement: 1,
}
);
// Set up the association
Assignment.belongsTo(AccountModel, {
    foreignKey: { 
      name: 'accountID'
    }}),

module.exports = Assignment;