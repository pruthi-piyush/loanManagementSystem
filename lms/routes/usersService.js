
'use strict';

const constants = require('../constants/constants.js')
const dbConnector = require('../modules/databaseConnector.js').getInstance()

async function getUsers(req, res, next) {

  if( req.user.role === constants.UserRoles.CUSTOMER ) {
    return res.status(400).send("Roles Mismatch")
  }


  let result = await dbConnector.getUsers()

  res.status(200).send(result)


}


exports.getUsers = getUsers
