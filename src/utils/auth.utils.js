/*
 * file name: auth.utils.js
 * responsibility: responsible for all auth related util functions
 */

// importing dependencis
const crypto = require('crypto')

// function for generating OTP
function generateSecureOTP(length = 6) {
	// Generates a cryptographically secure random integer
	const min = Math.pow(10, length - 1)
	const max = Math.pow(10, length) - 1
	return crypto.randomInt(min, max + 1).toString()
}

// exporting functions
module.exports = {
	generateSecureOTP,
}