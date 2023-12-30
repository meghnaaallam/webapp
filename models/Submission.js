const { Sequelize} = require('sequelize');
const sequelizeDB = require('../dbConnect/sequelizeConnect');
const AssignmentModel = require('../models/Assignment');
const AccountModel = require('../models/Account')

const Submission = sequelizeDB.define('submissions',{
    id: {
        type: Sequelize.UUID, // Use DataTypes.UUID for UUIDs
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    submission_url: {
    type: Sequelize.STRING,
     required: true,
     allowNull: false,
     validate: {
        isUrl: true, 
      },
    },
    submission_date: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
    },
    submission_updated: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
    }
});
    // Set up the association
Submission.belongsTo(AssignmentModel, {
    foreignKey: { 
      name: 'assignment_id'
}})
    
Submission.belongsTo(AccountModel, {
        foreignKey: { 
          name: 'user_id'
    }})

module.exports = Submission;