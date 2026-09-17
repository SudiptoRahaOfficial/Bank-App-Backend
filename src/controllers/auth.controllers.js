/**
    - file name: auth.controllers.js
    - responsibility: responsible for all auth related api controllers
 */

// importing dependencis
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config/env.config')
const userModel = require('../models/user.model')
const otpModel = require('../models/otp.model')
const sessionModel = require('../models/session.model')
const { generateSecureOTP } = require('../utils/auth.utils')
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

		// generating otp & encrypting otp
		const otp = generateSecureOTP()
		const otpHash = await bcrypt.hash(otp, 10)

		// creating new otp document to db
		const otpDoc = await otpModel.create({
			email: user.email,
			user: user._id,
			otpHash,
			expiresAt: new Date(Date.now() + 3 * 60 * 1000),
		})

		try {
			// sending email to user on signup
			await sendSignupEmail(user.email, user.name, otp)
		} catch (emailError) {
			// if email sending failed remove the newly created OTP
			await otpModel.deleteOne({
				_id: otpDoc._id,
			})

			// throwing email error
			throw emailError
		}

		// response back on success
		return res.status(201).json({
			message: 'Signup successful! Please verify your email.',
			status: 'success',
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				verified: user.verified,
			},
		})
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
		return res.status(500).json({
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

		// creating an empty session to generate a unique session id
		const session = await sessionModel.create({
			user: user._id,
			ip: req.ip,
			userAgent: req.headers['user-agent'],
		})

		// generating refresh token
		const refreshToken = jwt.sign(
			{
				type: 'refresh',
				id: user._id,
				sessionId: session._id,
			},
			config.JWT_REFRESH_TOKEN_SECRET,
			{ expiresIn: '7d' },
		)

		// hashing & storing refresh token at session
		const refreshTokenHash = await bcrypt.hash(refreshToken, 10)
		session.refreshTokenHash = refreshTokenHash
		await session.save()

		// setting refreshToken to browser's cookie
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
		})

		// generating access token
		const accessToken = jwt.sign(
			{
				type: 'access',
				id: user._id,
				sessionId: session._id,
			},
			config.JWT_ACCESS_TOKEN_SECRET,
			{ expiresIn: '15m' },
		)

		// response back on success
		return res.status(200).json({
			message: 'User signed in successfully',
			status: 'success',
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				verified: user.verified,
			},
			accessToken,
		})
	} catch (error) {
		// logging on unexpected server error
		console.error(error)

		// response back on server error
		return res.status(500).json({
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