/*
    - file name: account.routes.js
    - responsibility: responsible for all account related api endpoints
 */

// importing dependencis
const router = require('express').Router()
const { authenticateUser } = require('../middlewares/auth.middlewares')
const {
	createAccountController,
} = require('../controllers/account.controllers')

// create-account : POST API - "/api/accounts/create-account"
router.post('/create-account', authenticateUser, createAccountController)

// exporting router
module.exports = router