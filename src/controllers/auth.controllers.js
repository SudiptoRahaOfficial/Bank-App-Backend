/**
    - file name: auth.controllers.js
    - responsibility: responsible for all auth related api controllers
 */

// importing dependencis
const userModel = require('../models/user.model')

/**
    - signup controller
    - POST API - "/api/auth/signup"
 */
async function signupController(req, res) {
	// extracting all data sent by client
	const { name, email, password } = req.body
}

// exporting controllers
module.exports = {
	signupController,
}