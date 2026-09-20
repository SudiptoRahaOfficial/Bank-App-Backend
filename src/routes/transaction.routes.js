/*
    - file name: transaction.routes.js
    - responsibility: responsible for all transaction related api endpoints
 */

// importing dependencis
const router = require('express').Router()
const { authenticateUser } = require('../middlewares/auth.middlewares')
const {
	createTransactionController,
} = require('../controllers/transaction.controllers')

// create-transaction : POST API - "/api/transaction/create-transaction"
router.post(
	'/create-transaction',
	authenticateUser,
	createTransactionController,
)

// exporting router
module.exports = router