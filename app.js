
const express = require('express');
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
dotenv.config();
const logger = require('../webapp/utils/logger')

//express app

const app = express();
app.use(express.json()); //Helps parse JSON Body

const fs = require('fs');
const bcrypt = require('bcryptjs'); 
const { parse } = require("csv-parse");
const pool = require("./dbConnect/db");
const sequelize= require("./dbConnect/sequelizeConnect");
const AccountModel = require('./models/Account');
const AssignmentModel = require('./models/Assignment');
const SubmissionModel = require('./models/Submission');

//listen for requests
app.listen(`${process.env.PORT}`, () => logger.info(`app listening on ${process.env.PORT}`));


//connect sequelize
  sequelize.authenticate()
         .then(()=> logger.info(`Database connected`))
         .catch((err) => logger.error(`Error`+ err))
         
sequelize.sync()
.then(() => {
  logger.info(`Drop and Re-Sync db.`);
  console.log(AssignmentModel.tableName);
fs.createReadStream('./opt/users.csv')
.pipe(parse({ delimiter: ",", from_line: 2 }))
.on("data", function (row) {
checkIfEmailExists(row);
})
.on("end", function () {
console.log("finished");
displayUsers();
})
.on("error", function (error) {
logger.error(error.message);
});
})
.catch((error) => {
  logger.error(`Error syncing database:`, error);
});

function checkIfEmailExists(row){
  let emailToCheck = row[2];
AccountModel.findOne({
  where: {
    email: emailToCheck,
  },
})
  .then((user) => {
    if (user) {
      // The email already exists in the database
      logger.info(`Email already exists:`);
    } else {
      // The email does not exist in the database
      logger.error('Email does not exist.');
      const password = row[3];
      hashPassword(password, row);
      //insert(row);
    }
  })
  .catch((error) => {
    logger.error(`Error checking email:`, error);
  });
}

function hashPassword(password, row) {
  const salt = bcrypt.genSaltSync();
 const hashedPassword = bcrypt.hashSync(password, salt);
 console.log(hashedPassword);
  row[3] = hashedPassword;
  insert(row);
}

// Create a new user
async function insert(row) {
const details = await AccountModel.create({ firstName: row[0], lastName: row[1], email: row[2], password: row[3] });
console.log("details:", details.firstName, details.lastName, details.email, details.password);
}



//Find all users
async function displayUsers() {
const users = await AccountModel.findAll();
console.log(users.every(user => user instanceof AccountModel)); // true
logger.info("All users:", JSON.stringify(users, null, 2));
}


// //Display assignments
// async function displayAssignments() {
//   const assignmentDetails = await AssignmentModel.findAll();
//   console.log(assignmentDetails.every(details => details instanceof AssignmentModel)); // true
//   console.log("Assignment Details:", JSON.stringify(assignmentDetails, null, 2));
//   }
//  displayAssignments(); 




 app.use('/v1/assignments',require('./routes/assigmentRoutes'));

 //app.use('/v1/assignments/:id/', require('./routes/submissionRoutes'));
 
 //  initializing routes
 app.use('/',require('./routes/healthCheckRoutes'));


//error handling 
app.use(function(err,req,res,next)
{
    //error to send error message
    logger.error(err.message)
    res.status(422).send({error : err.message});
});


