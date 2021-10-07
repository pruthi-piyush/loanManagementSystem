
'use strict';

const express = require('express')
const router = express.Router()
const registerService = require('./registerService.js')
const loginService = require('./loginService.js')
const loanRouter = require('./loanRouter.js')
const sessionMiddleware = require('../modules/sessionMiddleware.js')


router.post('/register', registerService.asCustomer)
router.post('/login', loginService.asCustomer)
router.post('/requestOtp', registerService.requestOtp)
router.post('/verifyOtp', registerService.verifyOtp)
router.use( '/loan', loanRouter )


module.exports = router

