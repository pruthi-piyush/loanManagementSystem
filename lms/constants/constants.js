
'use strict';

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


module.exports = {
  UserRoles : UserRoles,
  LoanApplicationStatus : LoanApplicationStatus
}
