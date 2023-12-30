# webapp - CSYE 6225

## About
Backend API using Node.js and Express to perform CRUD operations on Assignments. The Database used is PostgreSQL and ORM - Sequelize. 


- Users are being read from the /opt/users.csv file using Streams & Buffers.

- Users auth is done using Base64 Authentication 
- User Submissions


- Implemented CRUD Operations on Assignments. Endpoints:

- `GET v1/assignments/` Get Assignment (authenticated)
- `GET v1/assignments/:id` Get Assignment (authenticated)
- `POST v1/assignments/:id` Add new Assignment (authenticated)
- `PUT v1/assignments/:id` Update Assignment information
- `PATCH v1/assignments/:id` Update Assignment information - will give 405 error

- `DELETE v1/assignments/:id` Delete Assignment information


> Health Route:
- `GET /healthz` Health endpoint

### Prerequisites
- `git` (configured with ssh) [[link](https://git-scm.com/downloads)]
- `node` [[link](https://nodejs.org/en/download/)]
- `Postman` for API testing [[link](https://www.postman.com/downloads/)]
- `env` file for local Postgres step


#### How to run? (WebApp)
1. Clone the repository from Organization
2. Install the following dependencies
   ```
      npm install
      ```
3. Run the program using this command

    ```
     node app.js
    ```

#### How to test? (WebApp)
The test cases are written using Jest and Supertest. 

The command to run the tests is :
   ```
      npx run test
