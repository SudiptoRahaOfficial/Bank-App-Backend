/**
    - file name: rate-limit.middlewares.js
    - responsibility: responsible for API rate limiting
 */

// importing dependencies
const { rateLimit } = require('express-rate-limit')

// verify-email endpoint rate limiter
const verifyEmailRateLimiter = rateLimit({
	// rate-limit window
	windowMs: 10 * 60 * 1000, // 10 minutes

	// maximum requests allowed from one IP
	limit: 12,

	// send standard RateLimit headers
	standardHeaders: 'draft-8',

	// disable legacy X-RateLimit-* headers
	legacyHeaders: false,

	// response when rate limit is exceeded
	message: {
		message: 'Verify email attempts over, please try later.',
		status: 'failed',
	},

	// HTTP status code when rate limit is exceeded
	statusCode: 429,
})

// resend-verify-email endpoint rate limiter
const resendVerifyEmailRateLimiter = rateLimit({
	// rate-limit window
	windowMs: 10 * 60 * 1000, // 10 minutes

	// maximum requests allowed from one IP
	limit: 3,

	// send standard RateLimit headers
	standardHeaders: 'draft-8',

	// disable legacy X-RateLimit-* headers
	legacyHeaders: false,

	// response when rate limit is exceeded
	message: {
		message: 'Resend email attempts over, please try later.',
		status: 'failed',
	},

	// HTTP status code when rate limit is exceeded
	statusCode: 429,
})

// exporting middlewares
module.exports = {
	verifyEmailRateLimiter,
	resendVerifyEmailRateLimiter,
}