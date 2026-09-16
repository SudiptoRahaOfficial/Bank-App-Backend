/*
 * file name: connectDB.js
 * responsibility: responsible for making db connection
 */

// importing dependencis
const { connect } = require('mongoose')
const config = require('../config/env.config')

// function for db connection
async function connectDB() {
	try {
		await connect(config.MONGO_DB_URI)
		console.log('Database connected successfully!')
	} catch (error) {
		console.log('Failed to connect database!', error.message)
	}
}

// exporting db-connection function
module.exports = connectDB