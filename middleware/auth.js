const bcrypt = require('bcryptjs'); 
const AccountModel = require('../models/Account');
const logger=require('../utils/logger');
//const AssignmentModel = require('../models/Assignment');

 const basicAuth = async (req, res, next) => {
    // If 'Authorization' header not present
    if(!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1){
       return res.status(401).send("Missing Authorization Header");
    } else {
        // Decode the 'Authorization' header Base64 value
       
        const [email, password] = Buffer.from(req.get('Authorization').split(' ')[1], 'base64')
            // <Buffer 75 73 65 72 6e 61 6d 65 3a 70 61 73 73 77 6f 72 64>
            .toString()
            // username:password
            .split(':')
        // ['username', 'password']


        // console.log("Middleware username: "+ email)
        // console.log("Middleware pwd: "+ password)


        const foundUser = await AccountModel.findOne({
                where: {email},
        })

        console.log("\n\n\n", foundUser, "\n\n\n")


            if(!foundUser){
                logger.error(`Auth not found. Error`)
                res.status(401).send("Please check email and password. Authorization in Middleware failed")
            }
        

        const validPassword = await bcrypt.compare(password, foundUser.password);
        if (!validPassword)
       return res.status(401).send("Password incorrect. Authorization in Middleware failed");
        
        req.currUser = {
            id: foundUser.id,
            username: foundUser.email,
            password: foundUser.password,
            firstname:foundUser.firstName,
            lastname:foundUser.lastName
        }
        // Continue the execution
        next();

    }
}

module.exports = basicAuth;