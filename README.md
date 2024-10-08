# Cloud Native Webapp - CSYE 6225

![csye6225](https://github.com/user-attachments/assets/f6ee57f1-21c6-48bb-a960-453204e210c0)

## About
RESTful Backend API for an **Assignment Submission Portal** using Node.js, Express, and Sequelize to perform CRUD operations.  


- The app creates users from ```./opt/users.csv``` file. Every user has an email and password as their credentials. Authorization is done using Base64

  
- Only authorized and authenticated users can access the following endpoints

- `GET v1/assignments/`  Get Assignment 
- `GET v1/assignments/:id`  Get Assignments 
- `POST v1/assignments/:id`  Add a new Assignment
- `PUT v1/assignments/:id`  Update Assignment information 
- `DELETE v1/assignments/:id`  Delete Assignment information


Users that are not authenticated do not have access to the above endpoints but can access the following end-point

- `GET /healthz`: Performs a health check, verifying the connection to the database.

- The app uses **Packer** to build AMI Images on AWS, *Pulumi* to upload the app to EC2 Instances that has auto-scaling groups set up See **Pulumi** code [here](https://github.com/meghnaaallam/iac-pulumi.git)

-  **statsD** to launch the app as soon as the application is deployed to EC2

- I have implemented a small use-case of microservice, where an email will be triggered on successful assignment submission. If the assignment submitted is after the deadline then an unsuccessful submission email is sent.
- The microservice is triggered via **Amazon SES** (I've configured a topic subscription and written the lambda function code [here](https://github.com/meghnaaallam/serverless.git) to publish AWS SNS messages to send emails
  
- Email service used - **Mailgun**
- **Winston** -  Winston is used for logging, providing both console and file-based logging

### Prerequisites
- `git` (configured with ssh) [[link](https://git-scm.com/downloads)]
- `node` [[link](https://nodejs.org/en/download/)]
- `Postman` for API testing [[link](https://www.postman.com/downloads/)]
- `env` file for local Postgres step


#### How to run? (WebApp)
1. Clone the repository from the Organization
2. Install the following dependencies
   ```js
      npm install
      ```
3. Run the program using this command

    ```js
     node app.js
    ```

#### How to test? (WebApp)
The test cases are written using Jest and Supertest. 

The command to run the tests is :
   ```js
      npx run test
```

### Building AMI Images using Packer

Create the .pkr.hcl template
The custom AMI should have the following features:

**NOTE: The builder to be used is amazon-ebs.**

OS: Ubuntu 22.04 LTS

Build: built on the default VPC

Device Name: /dev/sda1/

Volume Size: 50GiB

Volume Type: gp2

Have valid provisioners. Pre-installed dependencies using a shell script.

> I've written a shell script to install dependencies needed for the app to run on the EC2 instance


### Custom AMI creation
To create the custom AMI from the .pkr.hcl template as mentioned above, use the commands given below:

```js
# Installs all packer plugins mentioned in the config template
packer init .
```

To format the template, use:

```js
packer fmt .
```

To validate the template, use:
```js
# to validate syntax only
packer validate -syntax-only .
# to validate the template as a whole
packer validate -evaluate-datasources .
```

To build the custom AMI using packer, use:
```js
packer build <filename>.pkr.hcl
```

> Packer HCL Variables
To prevent pushing sensitive details we can have variables in I've used packer variables with the extension .pkrvars.hcl.

If you want to validate your build configuration, you can use the following command:
```
packer validate -evaluate-datasources --var-file=<variables-file>.pkrvars.hcl <build-config>.pkr.hcl
```

To use these variables files when creating an image, use the build command as shown:
```
packer build --var-file=<variables-file>.pkrvars.hcl <build-config>.pkr.hcl
```

### CI/CD

This CI pipeline will run if any changes are committed to the master branch. Once the unit tests pass, the CI pipeline should check the validity of the packer build configuration and build the AMI Image, 
Configure CloudWatch for logging, Amazon SNS Topic subscription configuration (*AWS Credentials should be provisioned to build AMI Images, I made use of Github secrets*)

> Ideally, when I first developed this application, I've configured the CI/CD pipeline to check the packer validity whenever a PR is raised to the main branch and start building the AMI Images after the PR is merged.
> But currently, I only have the above setup.

