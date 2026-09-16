/*
 * file name: env.config.js
 * responsibility: responsible for all .env variables import
 */

// importing & configuring dotenv
require('dotenv').config()

// Error setup for environmental valriables defenation
if (!process.env.PORT) {
	throw new Error('PORT is not defined in .env')
}

if (!process.env.MONGO_DB_URI) {
	throw new Error('MONGO_DB_URI is not defined in .env')
}

// configuration object
const config = {
	PORT: process.env.PORT,

	MONGO_DB_URI: process.env.MONGO_DB_URI,
}

// exporting config object
module.exports = config