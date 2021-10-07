
'use strict';

const { Pool } = require('pg')

const cryptoOperations = require('./crypto/cryptoOperations.js').getInstance()
const constants = require('../constants/constants.js')


class DatabaseConnector {

  constructor() {

    // TODO : parse config params from environment
    this.pool = new Pool({
      host: 'localhost',
      user: 'redcarpet',
      database: 'redcarpet_db',
      password: 'admin123',
      port: 5432
    });

    this.attachCallbacks()

  }

  attachCallbacks() {
    
    this.pool.on('error', (err, client) => {
      console.log("Error from Connection Pool", err)
    })
  }


  async createUser(data) {

    try
    {
        var client = await this.pool.connect()
     
        // create user in transaction
        await client.query('BEGIN')

        // generate next user id
        let nextValue = await client.query(
            "select nextval('user_schema.user_account_seq_userid')" )

        let userId = nextValue.rows[0].nextval

        // hash password

        let password = await cryptoOperations.getHashedPassword(data.password)
        console.log(password)

        let res = await client.query(
            'insert into user_schema.user_account(user_id, login_id, password, salt) \
            values ( $1, $2, $3, $4 )', 
            [userId, data.phoneNumber, password.hashedPassword, password.salt] )


        res = await client.query(
            'insert into user_schema.user_basic_details values( $1, $2, $3, $4, $5 )',
            [userId, data.firstName, data.lastName, data.phoneNumber, data.emailId])


        res = await client.query(
            'insert into user_schema.user_current_role values( $1, $2, $3, $4 )',
            [userId, data.role, Date.now(), Date.now()])

        await client.query('COMMIT')

    }
    catch(e) {
        console.log("Error in Executing createUser query", e)
        await client.query('ROLLBACK');
        return false
    }
    finally {
        client.release()
    }

    return true

  }

  async login(loginId, password) {

    try
    {
        // get client connection from connection pool
        var client = await this.pool.connect()

        // get salt and legit password corresponding to loginId

        let res = await client.query(
            'select salt, password, user_id from user_schema.user_account where login_id = $1', [loginId] )
        console.log(res)

        if( 0 === res.rows.length ) {
          console.log('Could Not Fetch Salt corresponding to this loginId')
          return { isAllowed : false }
        }

        let salt = res.rows[0].salt
        let legitPassword = res.rows[0].password
        let userId = res.rows[0].user_id

        let checkPasswordResponse = await cryptoOperations.verifyPassword(password, salt, legitPassword)

        if( false === checkPasswordResponse ) {
          return { isAllowed : false }
        }

        res = await client.query(
            'select user_role from user_schema.user_current_role where user_id = $1',
            [userId]
            )

        let role = res.rows[0].user_role
        console.log('User Role', role)
            
        return { isAllowed : true, userId : userId, role : role }
       
    }
    catch(e) {
        console.log("Error in loginService", e)
        return { isAllowed : false }
    }
    finally {
        client.release()
    }

  }

  async onNewLoanApplication(loan) {

    try
    {
        var client = await this.pool.connect()
     
        let res = await client.query(
            
            'insert into lms_schema.loan_applications( reference_id, customer_id, agent_id, application_status, amount, roi, tenure, created_at, updated_at ) \
            values ( $1, $2, $3, $4, $5, $6, $7, $8, $9 )', 
            [ 
              loan.referenceId,
              loan.customerId, 
              loan.agentId,
              loan.status,
              loan.amount,
              loan.rateOfInterest,
              loan.tenure,
              loan.creationTime,
              loan.updationTime
            ] )

        console.log(res)

    }
    catch(e) {
        console.log("Error in Executing loanApplication query", e)
        return false
    }
    finally {
        client.release()
    }

    return true
  }

    async updateTransactionHistory(referenceId) {

      const query = 'insert into lms_schema.loan_applications_history      \
                    ( reference_id, sequence_id, customer_id, agent_id, application_status, amount,  \
                     roi, tenure,  remarks )  \
                   (select reference_id, sequence_id, customer_id, agent_id, application_status, amount,    \
                                  roi, tenure, remarks                    \
                              FROM lms_schema.loan_applications                     \
                              WHERE reference_id = $1 )'

              try {
                var client = await this.pool.connect()

                var res = await client.query(query, [referenceId])
                console.log(res)
              }
              catch(err) {
                 console.log("Error in updating transaction history", err)
                 return false
              }
              finally {
                client.release()
              }

              return true

    }
 
  async onReplaceLoanRequest(loan) {

    let transactionHistoryUpdate = await this.updateTransactionHistory(loan.referenceId)
    if( false === transactionHistoryUpdate ){
      return false
    }

    try
     {
        var client = await this.pool.connect()

          var res = await client.query(
              'update lms_schema.loan_applications set sequence_id = sequence_id + 1, \
               updated_at = $1 , agent_id = $2, tenure = $3, roi = $4, amount = $5  \
               where reference_id = $6 and application_status = $7',
              [ Date.now(), 
                loan.agentId, 
                loan.tenure,
                loan.rateOfInterest,
                loan.amount,
                loan.referenceId,
                constants.LoanApplicationStatus.NEW
              ] 
              )

    }
    catch(err){
      console.log("Error in updating admin command", err)
      return false
    }
    finally {
      // free this connection to pool
      client.release()
    }

    console.log(res)
    if( 0 === res.rowCount ) {
      return false
    }

    return true

  }


  async onAdminUpdate(referenceId, status) {

    let transactionHistoryUpdate = await this.updateTransactionHistory(referenceId)
    if( false === transactionHistoryUpdate ){
      return false
    }

    try
    {
        var client = await this.pool.connect()

          var res = await client.query(
              'update lms_schema.loan_applications set application_status = $1, sequence_id = sequence_id + 1,         updated_at = $2 where reference_id = $3 and application_status = $4',
               [status, Date.now(), referenceId, constants.LoanApplicationStatus.NEW] 
              )

    }
    catch(err){
      console.log("Error in updating admin command", err)
      return false
    }
    finally {
      // free this connection to pool
      client.release()
    }

    console.log(res)
    if( 0 === res.rowCount ) {
      return false
    }

    return true

  }

  async getLoans(filters) {

    try {
        var client = await this.pool.connect()

        let query = 'select * from lms_schema.loan_applications ';
        let valuesArray = []
        
        if(filters.userId) {
          query = query + 'where customer_id = $1' 
          valuesArray.push(filters.userId)
        }

        let res = await client.query(query, valuesArray)
        return res.rows

    }
    catch(err) {
      console.log("Error in getting loans command", err)
      return false
    }
    finally {
      client.release()
    }

  }

  async getUsers() {

    try {
      var client = await this.pool.connect()

      let res = await client.query( 'select * from user_schema.user_basic_details \
                                    where uid IN \
                                    ( select user_id from user_schema.user_current_role where user_role = $1 )',
                                     [constants.UserRoles.CUSTOMER]
                                  )

      return res.rows
    }
    catch(err) {
      console.log("Error in getUsers service", err)
      return false
    }
    finally {
      client.release()
    }

  }

  static getInstance() {
    if( this._instance == null ) {
      this._instance = new DatabaseConnector()
    }

    return this._instance
  }

}

module.exports = DatabaseConnector
