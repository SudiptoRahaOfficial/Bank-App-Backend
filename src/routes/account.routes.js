/*
    - file name: account.routes.js
    - responsibility: responsible for all account related api endpoints
 */

// importing dependencis
const router = require('express').Router()
const { authenticateUser } = require('../middlewares/auth.middlewares')
const {
	createAccountController,
	getAllAccountsController,
} = require('../controllers/account.controllers')

// create-account : POST API - "/api/accounts/create-account"
router.post('/create-account', authenticateUser, createAccountController)

// get-all-accounts : GET API - "/api/accounts"
router.get('/', authenticateUser, getAllAccountsController)

// exporting router
module.exports = router