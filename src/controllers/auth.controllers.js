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
		console.error('Signup failed', {
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
	const normalizedEmail = email.trim().toLowerCase()

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

		// returning failed response if email not verified
		if (!user.verified) {
			return res.status(401).json({
				message: 'Email not verified',
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

		try {
			// sending email to user on signin
			await sendSigninEmail(user.email, user.name)
		} catch (emailError) {
			// logging email delivery failure
			console.error('Signin email delivery failed', {
				userId: user._id.toString(),
				email: user.email,
				error: emailError.message,
				stack: emailError.stack,
			})
		}

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
		console.error('Signin failed', {
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

/**
    - signout controller
    - POST API - "/api/auth/signout"
 */
async function signoutController(req, res) {
	// extracting refresh token
	const refreshToken = req.cookies.refreshToken

	// returning failed response if refresh token not found
	if (!refreshToken) {
		return res.status(401).json({
			message: 'Unauthenticated user, refresh token missing',
			status: 'failed',
		})
	}

	try {
		// verifying refresh token
		const decoded = jwt.verify(
			refreshToken,
			config.JWT_REFRESH_TOKEN_SECRET,
		)

		// extracting token type, user id and session id
		const { type, id, sessionId } = decoded

		// returning failed response if required data missing
		if (type !== 'refresh' || !id || !sessionId) {
			return res.status(401).json({
				message: 'Invalid refresh token',
				status: 'failed',
			})
		}

		// finding active session belonging to authenticated user
		const session = await sessionModel.findOne({
			_id: sessionId,
			user: id,
			revoked: false,
		})

		// returning failed response if session not found
		if (!session) {
			return res.status(401).json({
				message: 'Invalid refresh token',
				status: 'failed',
			})
		}

		// checking refresh token against stored session hash
		const isRefreshTokenValid = await bcrypt.compare(
			refreshToken,
			session.refreshTokenHash,
		)

		// returning failed response if refresh token doesn't match
		if (!isRefreshTokenValid) {
			return res.status(401).json({
				message: 'Invalid refresh token',
				status: 'failed',
			})
		}

		// revoking session & saving to db
		session.revoked = true
		await session.save()

		// clearing refreshToken from browser's cookies
		res.clearCookie('refreshToken', {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
		})

		// response back on success
		return res.status(200).json({
			message: 'User signed out successfully',
			status: 'success',
		})
	} catch (error) {
		// returning failed response if refresh token verification fails
		if (
			error.name === 'JsonWebTokenError' ||
			error.name === 'TokenExpiredError'
		) {
			res.clearCookie('refreshToken', {
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
			})

			return res.status(401).json({
				message: 'Invalid refresh token, verification fails',
				status: 'failed',
			})
		}

		// logging on unexpected server error
		console.error('Signout failed', {
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

/**
    - signout-all controller
    - POST API - "/api/auth/signout-all"
 */
async function signoutAllController(req, res) {
	// extracting refresh token
	const refreshToken = req.cookies.refreshToken

	// returning failed response if refresh token not found
	if (!refreshToken) {
		return res.status(401).json({
			message: 'Unauthenticated user, refresh token missing',
			status: 'failed',
		})
	}

	try {
		// verifying refresh token
		const decoded = jwt.verify(
			refreshToken,
			config.JWT_REFRESH_TOKEN_SECRET,
		)

		// extracting token type, user id and session id
		const { type, id, sessionId } = decoded

		// returning failed response if required data missing
		if (type !== 'refresh' || !id || !sessionId) {
			return res.status(401).json({
				message: 'Invalid refresh token',
				status: 'failed',
			})
		}

		// finding active session belonging to authenticated user
		const session = await sessionModel.findOne({
			_id: sessionId,
			user: id,
			revoked: false,
		})

		// returning failed response if session not found
		if (!session) {
			return res.status(401).json({
				message: 'Invalid refresh token',
				status: 'failed',
			})
		}

		// checking refresh token against stored session hash
		const isRefreshTokenValid = await bcrypt.compare(
			refreshToken,
			session.refreshTokenHash,
		)

		// returning failed response if refresh token doesn't match
		if (!isRefreshTokenValid) {
			return res.status(401).json({
				message: 'Invalid refresh token',
				status: 'failed',
			})
		}

		// revoking all active sessions belonging to the authenticated user
		await sessionModel.updateMany(
			{ user: id, revoked: false },
			{ revoked: true },
		)

		// clearing refreshToken from browser's cookies
		res.clearCookie('refreshToken', {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
		})

		// response back on success
		return res.status(200).json({
			message: 'Signed out from all devices successfully',
			status: 'success',
		})
	} catch (error) {
		// returning failed response if refresh token verification fails
		if (
			error.name === 'JsonWebTokenError' ||
			error.name === 'TokenExpiredError'
		) {
			res.clearCookie('refreshToken', {
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
			})

			return res.status(401).json({
				message: 'Invalid refresh token, verification fails',
				status: 'failed',
			})
		}

		// logging on unexpected server error
		console.error('Signout from all devices failed', {
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

/**
    - verify-email controller
    - POST API - "/api/auth/verify-email"
 */
async function verifyEmailController(req, res) {
	// extracting all data sent by client
	const { otp, email } = req.body

	// validating required fields
	if (!otp || !email) {
		return res.status(400).json({
			message: 'Email and OTP are required',
			status: 'failed',
		})
	}

	// validating fields type
	if (typeof email !== 'string' || typeof otp !== 'string') {
		return res.status(400).json({
			message: 'Email and OTP must be strings',
			status: 'failed',
		})
	}

	// normalizing email
	const normalizedEmail = email.trim().toLowerCase()

	// validating email format
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
		return res.status(400).json({
			message: 'Invalid email address',
			status: 'failed',
		})
	}

	// validating OTP format
	if (!/^\d{6}$/.test(otp)) {
		return res.status(400).json({
			message: 'Invalid OTP format',
			status: 'failed',
		})
	}

	try {
		// finding otp document to db
		const otpDoc = await otpModel.findOne({
			email: normalizedEmail,
			expiresAt: { $gt: new Date() },
		})

		// returning failed response if otp document not found
		if (!otpDoc) {
			return res.status(400).json({
				message: 'Invalid or expired OTP',
				status: 'failed',
			})
		}

		// securely comparing provided OTP with stored OTP
		const isOtpValid = await bcrypt.compare(otp, otpDoc.otpHash)

		// returning failed response if OTP is incorrect
		if (!isOtpValid) {
			return res.status(400).json({
				message: 'Invalid or expired OTP',
				status: 'failed',
			})
		}

		// updating verified status true at user document if OTP verified
		const user = await userModel.findOneAndUpdate(
			{ _id: otpDoc.user, verified: false },
			{ $set: { verified: true } },
			{ new: true },
		)

		// returning failed response if user does not exist
		if (!user) {
			return res.status(404).json({
				message: 'User not found',
				status: 'failed',
			})
		}

		// deleting all OTPs belonging to the user
		await otpModel.deleteMany({ user: otpDoc.user })

		// response back on success
		return res.status(200).json({
			message: 'Email verified successfully',
			status: 'success',
			user: {
				name: user.name,
				email: user.email,
				verified: user.verified,
			},
		})
	} catch (error) {
		// logging on unexpected server error
		console.error('Email verification failed', {
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

/**
    - resend-verify-email controller
    - POST API - "/api/auth/resend-verify-email"
 */
async function resendVerifyEmailController(req, res) {
	// extracting email sent by client
	const { email } = req.body

	// validating required field
	if (!email) {
		return res.status(400).json({
			message: 'Email is required',
			status: 'failed',
		})
	}

	// normalizing email
	const normalizedEmail = email.trim().toLowerCase()

	// validating email format
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
		return res.status(400).json({
			message: 'Invalid email address',
			status: 'failed',
		})
	}

	try {
		// finding user by normalized email
		const user = await userModel.findOne({
			email: normalizedEmail,
		})

		// returning failed response if user not exists
		if (!user) {
			return res.status(200).json({
				message: 'User not found',
				status: 'failed',
			})
		}

		// returning response if email already verified
		if (user.verified) {
			return res.status(200).json({
				message: 'Email already verified',
				status: 'failed',
			})
		}

		// invalidating all previously generated OTPs for this user
		await otpModel.deleteMany({
			user: user._id,
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
			await sendOTPEmail(user.email, user.name, otp)
		} catch (emailError) {
			// if email sending failed remove the newly created OTP
			await otpModel.deleteOne({
				_id: otpDoc._id,
			})

			// throwing email error
			throw emailError
		}

		// response back on success
		return res.status(200).json({
			message: 'A new OTP has been sent',
			status: 'success',
		})
	} catch (error) {
		// logging on unexpected server error
		console.error('OTP sending failed', {
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
	signupController,
	signinController,
	signoutController,
	signoutAllController,
	verifyEmailController,
	resendVerifyEmailController,
}