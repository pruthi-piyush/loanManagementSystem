'use strict';

const tokenManager = require('./tokenManager.js').getInstance()


module.exports = (req, res, next) => {

  let authorizationHeader = req.get('Authorization') || "";

  let token = ''
  
  let headerContents = authorizationHeader.split(' ');
  token = headerContents[1];

  if( !token ) {
    return res.status(400).send("Token Missing")
  }

  console.log("Client token", "token", token)

  let decodedTokenDetails = tokenManager.verify(token)
  console.log(decodedTokenDetails)

  req.user = decodedTokenDetails

  next()

}
