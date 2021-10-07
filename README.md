# loanManagementSystem


INSTALLATION GUIDE -


1. Database Setup :-
   
   - cd database/
   
   - Run command : sh createDatabase.sh

     This script expects that postgresql has already been installed on the server
     with a postgres user and database name postgres in it.

     It will prompt you to enter your password for creating
     a new user named redcarpet 
     and a new database redcarpet_db

     Password for redcarpet_db has been set to 'admin123' (without quotes)

     After that , this script will make schemas and tables on redcarpet_db.
     For this, it will prompt you for redcarpet_db password.

     Once schemas and tables for Loan Management System are done,

     this script creates a user with ADMIN role :-
     with following credentials :-

     user_id - 1130506200 (Unique Id auto generated by the system to be assigned to a new user)
     login_id - 1130506200 ( Phone Number of User )
     password is 'Admin@123' for this admin user and is stored in database 
                             using precomputed 64-bit pbkdf2 key.
                             More on this - Later.
     
2. For running application now without docker,
  
   cd lms
   node app.js

   Application will start listening on port 7001.
   
   Application connects to database via a module in code placed in lms/modules/databaseConnector.js .

   - code snippet for configuration of database.
     this.pool = new Pool({
                           host: 'localhost',
                           user: 'redcarpet',
                           database: 'redcarpet_db',
                           password: 'admin123',
                           port: 5432
                         });

     If you run postgresql server on a different host, port,
     please edit the configuration here.

     // TODO : This config should be picked from a configuration file.
     

3. For running application as a docker container :-

   - Build an image of this project using sh build-docker.sh .

   - Once Image is built successfully, you can run it using sh run-docker.sh .
     This should start a container with tag loanmanagementsystem:0.1 .


4. Design Flow :-


   REGISTERATION AND LOGIN :-


   This system considers 3 types of users login -

   CUSTOMER, AGENT AND ADMIN

   Customer Sign Up Flow :-

   - Request OTP on Phone Number

     Some sms agent could have been used here
     for now sending a random number

   - Verify OTP 

     Verifying Otp by keeping it in Ram as no external agents support for now

   - Once verified, he can hit register route

     This will first check that this person's phone number has been verified.
     We check this from RAM only. 
     Ideally, 
     this should come from REDIS like cache that this phone number has been verified 
     and with some expiry time.
   
     // Sample JSON
     {
       "firstName" : "Piyush",
       "lastName" : "Pruthi",
       "phoneNumber" : 17345,
       "password" : "Piyush@123",
       "emailId" : "pruthi.piyush@gmail.com"
     }  

   Customer Login :- 

   - He can login through his phoneNumer and password 

     { 
       "password" : "hello@123",
       "phoneNumber" : 17345
     }

   
   By Default, an ADMIN is inserted into database
   with these creds.

   Admin Login :-

   {
      "phoneNumber" : 1130506200,
      "password" : "Admin@123"
   }

   Agent Sign Up :-

   - Only Admin has the power to register an agent
     http://127.0.0.1:7001/admin/registerAgent

   {
      "phoneNumber" : 330,
      "firstName" : "A2",
      "emailId" : "a2@gmail.com"
   }

   - If any other entity tries to use this route other than Admin, a Roles Mismatch Response Will return

   - If successful,

     Registration Successful : Your Auto Generated Password is : 6e80ddb19d 

     This kind of response will be returned.

     // TODO :
     Agent should be given route to update his password


   Agent Login :-

   {
      "phoneNumber" : 330,
      "password" : "6e80ddb19d"
   }

-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------

REGISTERATION DESIGN CAVEAT :-

Ideally, this should be the hierarchy :-

SUPERADMIN -
            ADMIN
                 -
                  AGENT
                  - 
                    CUSTOMER


SuperAdmin will have power to make admins.

But for sake of simplicity, for now SuperAdmin concept is not implemented.


-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------

Password Storing -

  - Password hash is stored in database along with its salt.
  
  - Using PBKDF2 algorithm to prevent rainbow attacks.

  - All the cryptography operations are in lms/modules/crypto/cryptoOperations.js file

  - A random salt is generated first :-

      async getRandomSalt(length = SALT_SIZE) {

        return await crypto.randomBytes(length/2)

      }

      async getPbkdf2Hash(password, salt) {

        return new Promise( (resolve, reject) => {
            crypto.pbkdf2(password, salt, HASHING_ROUNDS, 32, 'sha256', (err, derivedKey) => {
              resolve(derivedKey)
              })
      })

    - Then , password is passed along with salt for 1000 rounds of pbkdf2 hashing

  - Upon Login Request,

    - Hash is recomputed using the provided password and salt
      and compared with Legit Password Hash.

    - If they match , 200 response is returned along with a token for hitting protected routes.

-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------

TOKEN ISSUING -


  - A JWT token is passed if login is successful.

  - JWT is selected in order to facilitate stateless authentication and remove any redis related dependencies.

  - Inside JWT token,

    playload is:-

    {
      userId  - uniqueId in system
      userRole - customer, agent or admin
    }

  - TODO:// 
    
    Add Expiry Time in JWT token

    Maintain a list of blacklisted tokens and keep them in redis
    so that we can make that token unusable asap.


For protected routes,

  - JWT token is verified through module modules/sessionMiddleware.js


-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------


LOAN FLOW -


  - A New Loan is placed by Agent

  http://127.0.0.1:7001/agent/loan/new

  {
      "amount" : "8900.88",
      "rateOfInterest" : "5",
      "tenure" : 3,
      "emi" : 100,
      "customerId" : 1
  }

  - Amount is taken in Rs. and is converted to Paisa to store in DB.

  - Converting to Paisa to avoid any precision loss
    and perform fast operations as float operations 
    cost much more than integer operations.

  - Loan structure is kept in :- lms/modules/loan.js

  - Each and every NEW loan request is given a referenceId.

  - For simplicity, taking uuid for now. But, this can be an integer for applying fast operations.

  - Agent can replace the loan too by specifying original referenceId with updated details.

  http://127.0.0.1:7001/agent/loan/replace

  {
      "amount" : "310.81",
      "rateOfInterest" : "5",
      "tenure" : 3,
      "emi" : 100,
      "customerId" : 1,
      "referenceId" : "431b5405-f73c-4097-b290-0c2264b435c0"
  }

  - Only ADMIN can approve or reject a loan using 

    http://127.0.0.1:7001/admin/loan/status/update

    {
      "referenceId" : "431b5405-f73c-4097-b290-0c2264b435c0",
        "status" : 3
    }

  - A loan request once Approved or Rejected can not be changed to any other status.

-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------


TRANSACTION HISTORY -

  - Maintaining transactions in 2 tables :-

      lms_schema.loan_applications
      lms_schema.loan_applications_history

      lms_schema.loan_applications contains updated transactions - their latest state.
      lms_schema.loan_applications_history - each transaction request history is maintained in this table
      using sequence_no . Sequence no. increments with every new request for a same referenceId.

-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------


VIEW -

  - Customers can view only their loans -
    GET http://127.0.0.1:7001/customer/loan/view

  - Agent and Admin can view all customer's loans -
    GET http://127.0.0.1:7001/agent/loan/view
    GET http://127.0.0.1:7001/admin/loan/view

  - All users can be seen via -
    GET http://127.0.0.1:7001/agent/users/view
    GET http://127.0.0.1:7001/admin/users/view


-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------



Code Flow :-


- All the route entry points are defined in lms/routes folder.

- Modules are in lms/modules

  databaseConnector.js - Contains Db related operations

  crypto folder contains all cryptography related operations

  tokenManager.js - Contains Token Related operations


- Constants are kept in lms/constants/constants.js

  const UserRoles = {

          UNKNOWN : 0,
          ADMIN : 1,
          AGENT : 2,
          CUSTOMER : 3,
          MAX : 4

  }


  const LoanApplicationStatus = {

          INVALID : 0,
          NEW : 1,
          APPROVED : 2,
          REJECTED : 3

  }

-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------


ROUTES LIST :-

  - Postman Collection Link :-  https://www.getpostman.com/collections/71e76ef833c6933109cf

  - Customer Request OTP - 

    POST http://127.0.0.1:7001/customer/requestOtp

    {
        "phoneNumber" : "17345"
    }

  - Customer Verify OTP - 

    POST http://127.0.0.1:7001/customer/verifyOtp

    {
      "otp" : 9104,
      "phoneNumber" : "17345"
    }

  - Admin Login -

    POST http://127.0.0.1:7001/admin/login

    {
          "phoneNumber" : 1130506200,
          "password" : "Admin@123"
    }

  - Agent SignUp -

    POST http://127.0.0.1:7001/admin/registerAgent

    {
      "phoneNumber" : 330,
      "firstName" : "A2",
      "emailId" : "a2@gmail.com"
    }

  - Agent Login - 

    POST http://127.0.0.1:7001/agent/login

    {
          "phoneNumber" : 17345,
          "password" : "Agent@123"
    }

  - NEW LOAN - 

  POST http://127.0.0.1:7001/agent/loan/new

  {
      "amount" : "8900.88",
      "rateOfInterest" : "5",
      "tenure" : 3,
      "emi" : 100,
      "customerId" : 1
  }

  - REPLACE LOAN

  POST http://127.0.0.1:7001/agent/loan/replace

  {
      "amount" : "310.81",
      "rateOfInterest" : "5",
      "tenure" : 3,
      "emi" : 100,
      "customerId" : 1,
      "referenceId" : "431b5405-f73c-4097-b290-0c2264b435c0"
  }

  - ADMIN UPDATE LOAN 

  POST http://127.0.0.1:7001/admin/loan/status/update

  {
      "referenceId" : "431b5405-f73c-4097-b290-0c2264b435c0",
      "status" : 3
  }

  - VIEW LOANS

  GET http://127.0.0.1:7001/admin/loan/view
  GET http://127.0.0.1:7001/agent/loan/view

  - CUSTOMER VIEW LOANS

  GET http://127.0.0.1:7001/customer/loan/view

  - VIEW USERS

  GET http://127.0.0.1:7001/agent/users/view

- All Protected Routes Expect 
  
  Authorization header in Http Request:-

  e.g. Authorization Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.  
                            eyJ1c2VySWQiOjIsInJvbGUiOjIsImlhdCI6MTU1MTY4ODMzNH0.
                            Cz07KoBHAIVhROylIe6iniX03CwB-nIWp4G_yqlIeuc

******************************************************************************************** 
******************************************************************************************** 
******************************************************************************************** 
******************************************************************************************** 
******************************************************************************************** 


     















  

  























   





   








