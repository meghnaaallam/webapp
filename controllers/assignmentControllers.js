const AssignmentModel = require('../models/Assignment');
const auth = require('../middleware/auth')
const { Sequelize} = require('sequelize');
//const AccountModel = require('../models/Account');
const logger = require('../utils/logger')
const client=require('../utils/cloudWatch')
const SubmissionModel = require('../models/Submission');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const sns = new AWS.SNS();


const getAssignments = async(req,res,next) =>  {
    let hasError = false;
    res.header('Cache-Control', 'no-cache'); 
    console.log('GET all assignments');
    logger.info(`Fetching all assignments`)

    try {
        client.increment("Get_All_Assignment_Details")
    const getAllAssignments = await AssignmentModel.findAll({
        })
     .catch((error)=>  {
            hasError = true
            return res.status(400).json(error);
        })
        const contentLength = parseInt(req.get('Content-Length') || '0', 10);
        logger.info(`Body Validation`);
        if(Object.keys(req.query).length >0 || contentLength > 0 ) {
            return  res.status(400).json("Body and Query Params not allowed");
        }
        if(getAllAssignments) {
    return res.status(200).json(getAllAssignments);
}
    }
      catch(error){
    
        if(!hasError)
          return res.status(400).json(error);
    }
}
    
 const getAssignment = async (req, res, next) => {   //Search by id - auth required
    res.header('Cache-Control', 'no-cache');
        let hasError = false
        try{
            client.increment("Get_Assignment_Details")
            const { protocol, method, hostname, originalUrl } = req
            logger.info(`Checking if Assignment exists`)
          const foundAssignment = await AssignmentModel.findOne({
                where: { id: req.params.id }
            })
                .catch((error)=>  {
                    hasError = true
                    return  res.status(400).json(error);
                })
     const contentLength = parseInt(req.get('Content-Length') || '0', 10);
                if(Object.keys(req.query).length >0 || contentLength > 0 ) {
                    return  res.status(400).json("Body and Query Params not allowed");
                }

            if(!foundAssignment)
                return res.status(404).json({message:'No such Assignment. Please check id'});
                logger.info(`Assignment found`)
            return res.status(200).json(foundAssignment);
    

        } catch (error){
            if(!hasError)
                return res.status(400).json(error);
        }
    }

    const postAssignment = (req, res) => {
        let hasError = false
        try{
            client.increment("Create_Assignment")
            const { protocol, method, hostname, originalUrl } = req    
            const assignment = req.body
            //checking if mandatory fields are present
            logger.info(`Checking if all mandatory fields are present`)
                if(!assignment.name || !assignment.points || !assignment.num_of_attempts || !assignment.deadline)
               return res.status(401).json({message:"Name, points, num_of_attempts, deadline are mandatory fields"});
//Body Validation
logger.info(`Body Validation`);
        if(assignment.assignment_created || assignment.id || assignment.assignment_updated || assignment.account_id)
         return res.status(403).json({message:"ID, Account Id, Date added and updated are read only fields"})
    
            //Check if points are valid
            const {message,status} = checkPoints(assignment.points);
            logger.info(res);
            // const {message, status} = res
            if(!status)
                return  res.status(400).json({
                    message: message
                });
     
         //Check if number of attempts are valid
         const {mess, stat} = checkAttempts(assignment.num_of_attempts)
         if(!stat)
             return  res.status(400).json({
                mess: mess
            });

            assignment.accountID = req.currUser.id;
            logger.info(assignment)

            // //Check if assignment is a timestamp
            // if(typeof assignment.deadline!== '[object Date]')
            //     return res.status(400).json("Assignment name should be a string");
                 createAssignment(assignment, req, res);    
        } catch(error) {
            hasError = true
            if(!hasError)
          return res.status(400).json(error)
        }
    }

    function createAssignment(assignment, req, res) {
      return AssignmentModel.create(assignment)
            .then((createdAssignment)=>{
                logger.info(`Assignment created`)
            return res.status(201).json(createdAssignment)})
            .catch((error)=>  {
                hasError = true
                return res.status(400).json(error)})
    }

    const deleteAssignment = async (req, res) => {
        try {
            client.increment("Delete_Assignment");
            const { protocol, method, hostname, originalUrl } = req;
            logger.info(`Checking if Assignment exists`)
            const foundDeleteAssignment = await AssignmentModel.findOne({
                where: { id: req.params.id }
            });
    
            if (!foundDeleteAssignment)
                return res.status(404).json({ message: "No such Assignment. Please check id" });
    
            logger.info(`Checking if User is authorized`)   
            if (foundDeleteAssignment.accountID !== req.currUser.id)
                return res.status(403).json({ message: "You don't have access to this Assignment" });
    
            await foundDeleteAssignment.destroy();
            logger.info(`Assignment successfully deleted`)
            return res.status(204).json({ message: "No content" });
        } catch (error) {
            logger.error(`Something is wrong`,error);
            return res.status(400).json({ error: error.message });
        }
    };
    
//patch
    const patchAssignments = (req, res) => {
        logger.info(`Can't use patch request`)
        return res.status(405).json({message:"Cannot use Patch"})
}

//put request
   const putAssignment = async (req, res) => {
        let hasError = false
        try{
            client.increment("Update_Assignment_Details")
            const { protocol, method, hostname, originalUrl } = req
            const assignment = req.body
           if(req.body!== null) {

            //Checking if mandatory fields are present
            logger.info(`Checking if all mandatory fields are present`)
            if(!assignment.name || !assignment.points || !assignment.num_of_attempts || !assignment.deadline)
            return res.status(400).json({message:"Name, points, num_of_attempts, deadline are mandatory fields"});
           }
           logger.info(`Checking if Assignment exists`)
            const foundAssignment = await AssignmentModel.findOne({
                where: { id: req.params.id }
            })
                .catch((error)=>  {
                    hasError = true
                    return res.status(204).json(res)})
    
            if(!foundAssignment)
                return res.status(400).json({message: "No such Assignment. Please check id"})
    
            //`Checking if User is authorized
            logger.info(`Checking if User is authorized`)
            if(foundAssignment.accountID!==req.currUser.id)
                return res.status(403).json({message: "You don't have access to this Assignment"})
//Body validation
logger.info(`Body Validation`)
        if(assignment.assignment_created || assignment.id || assignment.assignment_updated || assignment.account_id)
        return res.status(403).json({message:"ID, Account Id, Date added and updated are read only fields"})
  
        // const existingAssignment = await AssignmentModel.findOne({
        //     where: { name: req.body.name, points:req.body.points, num_of_attempts:req.body.num_of_attempts, deadline:req.body.deadline }
        // }).catch((error)=>  {
        //     hasError = true
        //     return res.status(400).json()})

        
  //Check if points are valid
            const {message, status} = checkPoints(assignment.points)
            if(!status)
                return res.status(400).json({message})
    
 //Check if assignment is a timestamp
 logger.info(`Checking if Assignment Deadline is a string`)
 if(assignment.deadline instanceof Date)
 return res.status(400).json({message:"Assignment name should be a string"});
    
            assignment.accountID = req.currUser.id;
    
            await AssignmentModel.update(assignment, {
                where: { id: req.params.id },
                returning: true
            })
                .then(async ()=>{
                    const updatedAssignment = await AssignmentModel.findOne({
                        where: { id: req.params.id }
                    }).catch((error)=>  {
                        hasError = true
                        return res.status(400).json(error)});
    
                    const responseObj = {
                            id: updatedAssignment.id,
                            name: updatedAssignment.name,
                            points: updatedAssignment.points,
                            num_of_attempts: updatedAssignment.num_of_attempts,
                            deadline: updatedAssignment.deadline,
                            assignment_created: updatedAssignment.assignment_created,
                            assignment_updated: updatedAssignment.assignment_updated,
                            accountID: updatedAssignment.accountID
                        }
                    //assignment updated successfully
                    logger.info(`Product updated successfully`)
                    return res.status(204).json(responseObj);
                })
                .catch((error)=>  {
                    hasError = true
                    return res.status(400).json(res)})
    
    
        } catch(error) {
            if(!hasError)
            logger.error(error)
                return res.status(400).json(error)
        }
    }
    const checkPoints = (points)=>{

      const pointsEntered =  typeof points
      logger.info(`Checking if points is valid number`)
        if (pointsEntered !== "number"){
            console.log("Here 1")
            return {message:"Points should be a number and not a string", status: false}
        }
        logger.info(`Checking if points is a negative number` )
              if(points<0){
            console.log("Here 2")
            return {message:"Points cannot be less than 0", status: false}
        }
        logger.info(`Checking if points is more than 10. Points should be from 0 to 10 only` )
        if(points>10){
            console.log("Here 3")
            return {message: "Points quantity cannot be more than 10", status: false}
        }
            return {message:"", status:true}
    }   

   
 const checkAttempts = (attempts) => {
    logger.info(`Checking if Attempts is valid number` )
    if (typeof attempts !== 'number')
    return {mess: "Attempts should be a number and not a string", stat: false}

    logger.info(`Checking if Attempts is a negative number` )
if(attempts<1)
    return {mess: "Attempts cannot be less than 1", stat: false}

    logger.info(`Checking if Attempts is greater than 100` )
if(attempts>100) {
    return {mess: "Attempts cannot be more than 100", stat: false}
}
return {mess:attempts, stat: true}
 }



 const postSubmission = (req, res)=> {
    let hasError = false
    try {
        logger.info("submittion")
        client.increment("Submission Posted")
            const { protocol, method, hostname, originalUrl } = req    
            const submission = req.body
             //checking if mandatory fields are present
             logger.info(`Checking if all mandatory fields are present`)
             if(!submission.submission_url)
            return res.status(401).json({message:"Submission Url is a mandatory fields"});
        //Body Validation
logger.info(`Body Validation`);
if(submission.id || submission.assignment_id || submission.submission_date || submission.submission_updated) 
 return res.status(403).json({message:"ID, Assignment Id,Submission Date added and Submission updated are read only fields"})
submission.assignment_id = req.params.id;
submission.user_id = req.currUser.id;
console.log(submission.user_id)
 logger.info(submission)
    createSubmission(submission, req, res);    
} catch(error) {
    hasError = true
    if(!hasError)
  return res.status(400).json(error)
}
}

async function count(submission, req, res) {
    try {
        const data = await SubmissionModel.findAll({
            attributes: ['id', 'submission_date', 'submission_url', 'submission_updated', 'assignment_id'],
            where: { assignment_id: req.params.id, user_id: req.currUser.id },
            raw: true
        });

        return data.length+1;
    } catch (error) {
        console.error(error);
        return 0; // Return 0 or handle the error appropriately
    }
}

async function createSubmission(submission, req, res) {
    try{
    let submissionArray = await count(submission, req, res);

 const foundAssignment = await AssignmentModel.findOne({
    where: { id: req.params.id }
});

if (submissionArray > foundAssignment.num_of_attempts) {
    return res.status(403).send(`You cannot submit more than ${foundAssignment.num_of_attempts} times`);
}

let assignmentDeadline = new Date(foundAssignment.deadline);
let submission_time = new Date();
if (submission_time > assignmentDeadline) {

    return res.status(403).send(`You cannot submit after the deadline`); 
}


const createdSubmission = await SubmissionModel.create(submission);
logger.info(`Submission created`);
let submissionObj = {
    email: req.currUser.username,
    assignment_id: submission.assignment_id,
    assignment_name: foundAssignment.name,
    user_id: req.currUser.id,
    firstname: req.currUser.firstname,
    lastname: req.currUser.lastname,
    submission_url: submission.submission_url,
    submission_time: submission.submission_updated
}

console.log(submissionObj)
    // If submission is successful, publish to SNS topic
    const snsParams = {
        TopicArn: process.env.TOPIC_ARN, // Replace 'your-sns-topic-arn' with your SNS topic ARN
        Message: JSON.stringify(submissionObj),
      };
  
      await sns.publish(snsParams).promise();

  
return res.status(201).json(createdSubmission);
} catch (error) {
logger.error(`Something is wrong please check`,error);
return res.status(400).json(error);
}
  }



module.exports = { getAssignments, postAssignment, getAssignment, deleteAssignment, patchAssignments, putAssignment , postSubmission};