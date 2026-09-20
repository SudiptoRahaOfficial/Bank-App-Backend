/**
	- file name: app.js
	- responsibility: responsible for application's root functionalities
 */

// importing dependencis
const express = require('express')
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/auth.routes')
const accountRouter = require('./routes/account.routes')
const transactionRouter = require('./routes/transaction.routes')

// making app
const app = express()

// middlewares array
const middlewares = [
	express.urlencoded({ extended: true }), // accept form-data
	express.json(), // accept json-data
	cookieParser(), // parse cookies from incoming requests
]
app.use(middlewares) // using middlewares

// connecting all API routes
app.use('/api/auth', authRouter)
app.use('/api/accounts', accountRouter)
app.use('/api/transaction', transactionRouter)

// exporting app
module.exports = app