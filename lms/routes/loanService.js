
'use strict';

const Loan = require('../modules/loan.js')
const constants = require('../constants/constants.js')
const uuidv4 = require('uuid/v4')
const dbConnector = require('../modules/databaseConnector.js').getInstance()
const utils = require('../modules/utils.js')


class LoanService {

  constructor() {
  }

  validateLoanRequest(req) {

    if(!req.body.amount) {
      throw { code : 400, msg : 'Missing Key : amount'} 
    }
    
    if(!req.body.rateOfInterest) {
      throw { code : 400, msg : 'Missing Key : rateOfInterest'} 
    }

    if(!req.body.tenure) {
      throw { code : 400, msg : 'Missing Key : tenure'} 
    }

    if(!req.body.emi) {
      throw { code : 400, msg : 'Missing Key : emi'} 
    }

    if(!req.body.customerId) {
      throw { code : 400, msg : 'Missing Key : customerId'} 
    }

  }


  async onNew(req, res, next) {

    if( req.user.role !== constants.UserRoles.AGENT ) {
      return res.status(403).send('Roles Mismatch')
    }

    console.log('--ON NEW LOAN--')

    try {
      this.validateLoanRequest(req)
    }
    catch(err) {
      console.log(err)
      return res.status(err.code).send(err.msg)
    }

    let loan = new Loan()

    // set customer id in loan
    loan.setCustomerId(req.body.customerId)

    // set agent id
    loan.setAgentId(req.user.userId)

    loan.setStatus(constants.LoanApplicationStatus.NEW)

    let amount = utils.convertToPaisa(req.body.amount)
    loan.setAmount(amount)
    loan.setEmi(req.body.emi)
    loan.setRateOfInterest(req.body.rateOfInterest)
    loan.setTenure(req.body.tenure)
    loan.setCreationTime(Date.now()) // taking current epoch time
    loan.setUpdationTime(Date.now())

    loan.setReferenceId( uuidv4() )

    loan.dump()

    let saveApplicationResponse = await dbConnector.onNewLoanApplication(loan)

    if( false === saveApplicationResponse ) {
      return res.status(400).send("Could not place a new loan request : Please check your customerId")
    }

    return res.status(200).send(loan)

  }

  async onReplace(req, res, next) {

    if( req.user.role !== constants.UserRoles.AGENT ) {
      return res.status(403).send('Roles Mismatch')
    }

    console.log('--ON REPLACE--')
    
    try {
      this.validateLoanRequest(req)
    }
    catch(err) {
      console.log(err)
      return res.status(err.code).send(err.msg)
    }

    if(!req.body.referenceId) {
      return res.status(400).send('Missing Key : referenceId')
    }

    let loan = new Loan()

    // set agent id
    loan.setAgentId(req.user.userId)
    
    let amount = utils.convertToPaisa(req.body.amount)
    loan.setAmount(amount)
    loan.setEmi(req.body.emi)
    loan.setRateOfInterest(req.body.rateOfInterest)
    loan.setTenure(req.body.tenure)
    loan.setUpdationTime(Date.now())
    loan.setReferenceId(req.body.referenceId)

    let replaceLoanResponse = await dbConnector.onReplaceLoanRequest(loan)

    if( false === replaceLoanResponse ) {
      
      console.log('Can Not Update Loan')
      return res.status(400).send('Can Not Update Loan Status')

    }
    
    return res.status(200).send('Loan Update Successful')

  }

  async onAdminUpdate(req, res, next) {

    if( req.user.role !== constants.UserRoles.ADMIN ) {
      return res.status(403).send('Roles Mismatch')
    }

    if(!req.body.referenceId) {
      return res.status(400).send("Missing Key : referenceId")
    }

    if(!req.body.status) {
      return res.status(400).send("Missing Key : status")
    }

    let statusUpdateResponse = await dbConnector.onAdminUpdate(req.body.referenceId, req.body.status)

    console.log(statusUpdateResponse)
    if( false == statusUpdateResponse ) {
      console.log('Can Not Update Loan Status')
      return res.status(400).send('Can Not Update Loan Status')

    }
    
    return res.status(200).send('Status Update Successful')

  }


  async getLoans(req, res, next) {
    console.log("Inside getLoans")
    
    let filters = {}
    if(!req.filters) {
      req.filters = {}
    }

    // if it is customer, send only his loans
    if(req.user.role === constants.UserRoles.CUSTOMER) {
      filters.userId = req.user.userId
    }

    let result = await dbConnector.getLoans(filters)

    console.log("getLoans Service response", result)

    res.status(200).send(result)
  
  }

}

module.exports = LoanService
