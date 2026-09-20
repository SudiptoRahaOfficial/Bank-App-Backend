/*
    - file name: account.controllers.js
    - responsibility: responsible for all account related api controllers
 */

// importing dependencis
const accountModel = require('../models/account.model')

/**
    - create account controller
    - POST API - "/api/accounts/create-account"
 */
async function createAccountController(req, res) {
	// extracting id from req.user
	const userId = req.user?.id

	// defensive authentication check
	if (!userId) {
		return res.status(401).json({
			message: 'Authentication required',
			status: 'failed',
		})
	}

	try {
		// creating new account to db
		const account = await accountModel.create({ user: userId })

		// response back on success
		return res.status(201).json({
			message: 'Account created successfully',
			status: 'success',
			account: {
				id: account._id,
				user: account.user,
				status: account.status,
				currency: account.currency,
			},
		})
	} catch (error) {
		// handling mongoose validation errors
		if (error?.name === 'ValidationError') {
			return res.status(400).json({
				message: 'Invalid account data',
				status: 'failed',
				errors: Object.values(error.errors).map((validationError) => ({
					field: validationError.path,
					message: validationError.message,
				})),
			})
		}

		// logging on unexpected server error
		console.error('Account creation failed', {
			error: error.message,
			stack: error.stack,
		})

		// response back on server error
		return res.status(500).json({
			message: 'Internal server error',
			status: 'failed',
		})
	}
}

// exporting controllers
module.exports = {
	createAccountController,
}