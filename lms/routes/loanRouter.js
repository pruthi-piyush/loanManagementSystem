
'use strict';

const express = require('express')
const router = express.Router()
const LoanService = require('./loanService.js')
const loanService = new LoanService()
const sessionMiddleware = require('../modules/sessionMiddleware.js')

router.use( sessionMiddleware )

router.post('/new', loanService.onNew.bind(loanService))
router.post('/replace', loanService.onReplace.bind(loanService))
router.post('/status/update', loanService.onAdminUpdate.bind(loanService))
router.get('/view', loanService.getLoans.bind(loanService))

module.exports = router


