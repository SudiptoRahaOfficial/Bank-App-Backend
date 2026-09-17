/*
 * file name: app.js
 * responsibility: responsible for application's root functionalities
 */

// importing dependencis
const express = require('express')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/auth.routes')

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
app.use('/api/auth', authRoutes)

// exporting app
module.exports = app