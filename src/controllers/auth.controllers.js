/**
    - file name: auth.controllers.js
    - responsibility: responsible for all auth related api controllers
 */

// importing dependencis
const bcrypt = require('bcryptjs')
const userModel = require('../models/user.model')
const {
	sendSignupEmail,
	sendSigninEmail,
	sendOTPEmail,
} = require('../services/email.service')

/**
    - signup controller
    - POST API - "/api/auth/signup"
 */
async function signupController(req, res) {
	// extracting all data sent by client
	const { name, email, password } = req.body

	// validating required fields
	if (!name || !email || !password) {
		return res.status(400).json({
			message: 'Name, email and password are required',
			status: 'failed',
		})
	}

	// validating fields type
	if (
		typeof name !== 'string' ||
		typeof email !== 'string' ||
		typeof password !== 'string'
	) {
		return res.status(400).json({
			message: 'Name, email and password must be strings',
			status: 'failed',
		})
	}

	// normalizing name & email
	const normalizedName = name.trim()
	const normalizedEmail = email.trim().toLowerCase()

	// validating name
	if (!normalizedName) {
		return res.status(400).json({
			message: 'Name cannot be empty',
			status: 'failed',
		})
	}

	// validating email format
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
		return res.status(400).json({
			message: 'Invalid email address',
			status: 'failed',
		})
	}

	// validating password's length
	if (password.length < 6) {
		return res.status(400).json({
			message: 'Password must be at least 6 characters',
			status: 'failed',
		})
	}

	try {
		// duplicate account check with email: "one email - one account"
		const isUserExists = await userModel.findOne({ email: normalizedEmail })
		if (isUserExists) {
			return res.status(409).json({
				message: 'User already exists with this email',
				status: 'failed',
			})
		}

		// encrypting password
		const passwordHash = await bcrypt.hash(password, 10)

		// creating new user
		const user = await userModel.create({
			name: normalizedName,
			email: normalizedEmail,
			password: passwordHash,
		})

		// response back on success
		res.status(201).json({
			message: 'User signed up successfully!',
			status: 'success',
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
			},
		})

		// sending email to user on successful signup
		await sendSignupEmail(user.email, user.name)
	} catch (error) {
		// handling duplicate account error
		if (error.code === 11000) {
			return res.status(409).json({
				message: 'User already exists with this email',
				status: 'failed',
			})
		}

		// logging on unexpected server error
		console.error(error)

		// response back on server error
		res.status(500).json({
			message: 'Internal server error',
			status: 'failed',
		})
	}
}

/**
    - signin controller
    - POST API - "/api/auth/signin"
 */
async function signinController(req, res) {
	// extracting all data sent by client
	const { email, password } = req.body

	// validating required fields
	if (!email || !password) {
		return res.status(400).json({
			message: 'Email and password are required',
			status: 'failed',
		})
	}

	// validating fields type
	if (typeof email !== 'string' || typeof password !== 'string') {
		return res.status(400).json({
			message: 'Email and password must be strings',
			status: 'failed',
		})
	}

	// normalizing email
	const normalizedEmail = email?.trim().toLowerCase()

	// validating email format
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
		return res.status(400).json({
			message: 'Invalid email address',
			status: 'failed',
		})
	}

	try {
		// finding user to db by email
		const user = await userModel.findOne({ email: normalizedEmail })

		// returning error response if user not found
		if (!user) {
			return res.status(401).json({
				message: 'Invalid email or password',
				status: 'failed',
			})
		}

		// checking for password valid/invalid
		const isPasswordValid = await bcrypt.compare(password, user.password)

		// returning error response if password invalid
		if (!isPasswordValid) {
			return res.status(401).json({
				message: 'Invalid email or password',
				status: 'failed',
			})
		}
	} catch (error) {
		// logging on unexpected server error
		console.error(error)

		// response back on server error
		res.status(500).json({
			message: 'Internal server error',
			status: 'failed',
		})
	}
}

// exporting controllers
module.exports = {
	signupController,
	signinController,
}