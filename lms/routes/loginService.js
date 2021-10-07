
'use strict'

const tokenManager = require('../modules/tokenManager.js').getInstance()
const dbConnector = require('../modules/databaseConnector.js').getInstance()
const constants = require('../constants/constants.js')


async function login(req) {

  let phoneNumber = req.body.phoneNumber
  let password = req.body.password

  if(!password) {
    return { code : 400, msg : "Missing Key : password" } 
  }

  if(!phoneNumber) {
    return { code : 400, msg : "Missing Key : phoneNumber" } 
  }

  // call service
  let loginResponse = await dbConnector.login(phoneNumber, password)

  if( false == loginResponse.isAllowed ) {

    // to prevent USER ENUMERATION ATTACK HERE 
    // dont send actual reason of not allowing login
    return { code : 403, msg : "Access Not Allowed" } 

  }

  // login is successfull
  // generate token and send to ui

  let payload = { userId : loginResponse.userId,
                  role : loginResponse.role
                }

  let token = tokenManager.generate( payload )

  return { code : 200, token : token, payload : payload }

}


async function asCustomer(req, res, next) {

  let loginResponse = await login(req)
  
  if( 200 !== loginResponse.code ) {
    return res.status(loginResponse.code).send(loginResponse.msg)
  }

  let payload = loginResponse.payload
  if(payload.role !== constants.UserRoles.CUSTOMER) {
    return res.status(400).send("Role Mismatch")
  }
  
  return res.status(200).send(loginResponse.token)

}

async function asAdmin(req, res, next) {
  
  let loginResponse = await login(req)
  
  if( 200 !== loginResponse.code ) {
    return res.status(loginResponse.code).send(loginResponse.msg)
  }

  let payload = loginResponse.payload

  if(payload.role !== constants.UserRoles.ADMIN) {
    return res.status(400).send("Role Mismatch")
  }

  return res.status(200).send(loginResponse.token)

}

async function asAgent(req, res, next) {
  
  let loginResponse = await login(req)
  
  if( 200 !== loginResponse.code ) {
    return res.status(loginResponse.code).send(loginResponse.msg)
  }

  let payload = loginResponse.payload

  if(payload.role !== constants.UserRoles.AGENT) {
    return res.status(400).send("Role Mismatch")
  }

  return res.status(200).send(loginResponse.token)

}


exports.asAdmin = asAdmin
exports.asAgent = asAgent
exports.asCustomer = asCustomer
