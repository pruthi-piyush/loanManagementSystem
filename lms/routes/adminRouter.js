
'use strict';

const express = require('express')
const router = express.Router()
const registerService = require('./registerService.js')
const loginService = require('./loginService.js')
const usersService = require('./usersService.js')
const loanRouter = require('./loanRouter.js')
const sessionMiddleware = require('../modules/sessionMiddleware.js')

router.use( ['/registerAgent', '/users/view'], sessionMiddleware )

router.post('/login', loginService.asAdmin)
router.post('/registerAgent', registerService.asAgent)
router.get('/users/view', usersService.getUsers)
router.use( '/loan', loanRouter )


module.exports = router

