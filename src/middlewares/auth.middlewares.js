/*
	- file name: auth.middlewares.js
	- responsibility: responsible for all auth related middlewares
 */

// importing dependencis
const jwt = require('jsonwebtoken')
const config = require('../config/env.config')
const sessionModel = require('../models/session.model')
const userModel = require('../models/user.model')

// middleware for authenticate user
async function authenticateUser(req, res, next) {
	// extracting authorization header from request
	const authorization = req.headers.authorization

	// returning failed response if authorization header not found
	if (!authorization) {
		return res.status(401).json({
			message: 'Authentication required',
			status: 'failed',
		})
	}

	// extracting authorization scheme and access token
	const [scheme, accessToken] = authorization.trim().split(/\s+/)

	// validating Bearer authentication scheme and access token
	if (scheme !== 'Bearer' || !accessToken) {
		return res.status(401).json({
			message: 'Invalid authorization header',
			status: 'failed',
		})
	}

	try {
		// verifying accessToken
		const decoded = jwt.verify(accessToken, config.JWT_ACCESS_TOKEN_SECRET)

		// extracting user id and session id
		const { type, id, sessionId } = decoded

		// returning failed response if required data missing
		if (type !== 'access' || !id || !sessionId) {
			return res.status(401).json({
				message: 'Invalid access token',
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
				message: 'Invalid access token',
				status: 'failed',
			})
		}

		// finding user by access token's id
		const user = await userModel.findById(id)

		// returning failed response if user not exist
		if (!user) {
			return res.status(401).json({
				message: 'Unauthenticated user',
				status: 'failed',
			})
		}

		// attaching authenticated user's id to request
		req.user = { id: user._id }

		// passing request on success path
		next()
	} catch (error) {
		// returning 401 if the access token is invalid or expired
		if (
			error.name === 'JsonWebTokenError' ||
			error.name === 'TokenExpiredError'
		) {
			return res.status(401).json({
				message: 'Invalid access token',
				status: 'failed',
			})
		}

		// logging on unexpected server error
		console.error('Authentication failed', {
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

// exporting middlewares
module.exports = {
	authenticateUser,
}