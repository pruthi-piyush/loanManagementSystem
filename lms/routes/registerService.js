'use strict';



const cryptoOperations = require('../modules/crypto/cryptoOperations.js').getInstance()
const constants = require('../constants/constants.js')

// Phone Number vs OTP dictionary
// for verifying otps sent to customers
let pendingCustomerVerifications = {}

let verifiedCustomers = {}

const dbConnector = require('../modules/databaseConnector').getInstance()

function generateOtp() {

  return Math.floor( Math.random() * 10000 ) // to generate 4 digit OTP

}

function requestOtp(req, res) {

  let phoneNumber = req.body.phoneNumber

  if(!phoneNumber) {
    return res.status(400).send("Please Enter Phone Number")
  }

  let otp = generateOtp()

  //  can send otp via sms agents here
  //  sendOtp(phoneNumber, otp)

  pendingCustomerVerifications[phoneNumber] = otp
  return res.status(200).send( { otp : otp} )

}

exports.requestOtp = requestOtp

function verifyOtp(req, res) {
  //Verify user phone number using otp service
  //to complete signup verification.

  let otp = req.body.otp
  let phoneNumber = req.body.phoneNumber

  if(!otp) {
    return res.status(400).send("Otp Missing")
  }

  if(!phoneNumber) {
    return res.status(400).send("Phone Number Missing")
  }

  if ( !phoneNumber in pendingCustomerVerifications ) {
    return res.status(400).send("Invalid Otp verification request.")
  }

  if( otp !== pendingCustomerVerifications[phoneNumber] ) {
    return res.status(400).send("Otp Mismatch.")
  }

  verifiedCustomers[phoneNumber] = "verified"

  res.status(200).send("Your Phone Number has been Verified")

}

exports.verifyOtp = verifyOtp

async function asCustomer(req, res, next) {

  // Authenticate that the phone number which is received in register request
  // has been already verified
  // check that phone number has been verified
  
  let phoneNumber = req.body.phoneNumber
  let firstName = req.body.firstName
  let lastName = req.body.lastName
  let password = req.body.password
  let emailId = req.body.emailId

  if(!phoneNumber) {
    return res.status(400).send("Missing Key : phoneNumber")
  }
 
  if( !(phoneNumber in verifiedCustomers) ) {
    return res.status(400).send("Kindly Verify Your Phone Number")
  }

  if(!password) {
    return res.status(400).send("Missing Key : password")
  }

  if(!firstName) {
    return res.status(400).send("Missing Key : firstName")
  }
  
  if(!emailId) {
    return res.status(400).send("Missing Key : emailId")
  }

  // send hashed password from ui to backend service

  console.log('First Name=', firstName)

  // after registration has been completed,
  // re-route ui to kyc component

  let data = { firstName : firstName,
               lastName : lastName,
               password: password,
               phoneNumber : phoneNumber,
               emailId : emailId,
               role : constants.UserRoles.CUSTOMER
             } 

  let createCustomerResponse = await dbConnector.createUser(data)

  if( false == createCustomerResponse ) {
    return res.status(500).send("Registration Unsuccessful : Please try with a different phone no.")
  }

  res.status(200).send('Registration Successful')

}

async function asAgent(req, res, next) {

  console.log("Inside As Agent")

  // confirm this url has been hit by admin
  if( req.user.role != constants.UserRoles.ADMIN ) {
    return res.status(403).send('')
  }

  let phoneNumber = req.body.phoneNumber
  let firstName = req.body.firstName
  let lastName = req.body.lastName
  let emailId = req.body.emailId

  if(!phoneNumber) {
    return res.status(400).send("Missing Key : phoneNumber")
  }
 
  if(!firstName) {
    return res.status(400).send("Missing Key : firstName")
  }
  
  if(!emailId) {
    return res.status(400).send("Missing Key : emailId")
  }

  // send hashed password from ui to backend service

  console.log('First Name=', firstName)
  
  // call crypto api here for entropy
  // for simplicity, using salt method here
  let autoGenratedPassword = await cryptoOperations.getRandomSalt(10)
  autoGenratedPassword = autoGenratedPassword.toString('hex')


  let data = { firstName : firstName,
               lastName : lastName,
               password: autoGenratedPassword,
               phoneNumber : phoneNumber,
               emailId : emailId,
               role : constants.UserRoles.AGENT
             } 

  let createAgentResponse = await dbConnector.createUser(data)
  
  if( false == createAgentResponse ) {
    return res.status(500).send("Registration Unsuccessful : Please try with a different phone no.")
  }

  res.status(200).send( `Registration Successful : Your Auto Generated Password is : ${autoGenratedPassword} `)

}

exports.asCustomer = asCustomer
exports.asAgent = asAgent


