/**
    - file name: rate-limit.middlewares.js
    - responsibility: responsible for API rate limiting
 */

// importing dependencies
const { rateLimit } = require('express-rate-limit')

// ============================================================
// SIGNIN - ACCOUNT RATE LIMITER
// ============================================================
const signinAccountRateLimiter = rateLimit({
	// rate-limit window
	windowMs: 10 * 60 * 1000, // 10 minutes

	// maximum login attempts for one email
	limit: 5,

	// send standard RateLimit headers
	standardHeaders: 'draft-8',

	// disable legacy X-RateLimit-* headers
	legacyHeaders: false,

	// use normalized email as the rate-limit key
	keyGenerator: (req) => {
		const email = req.body?.email

		if (!email) {
			return 'missing-email'
		}

		return email.trim().toLowerCase()
	},

	// response when rate limit is exceeded
	message: {
		message: 'Too many signin attempts. Please try again later.',
		status: 'failed',
	},

	// HTTP status code when rate limit is exceeded
	statusCode: 429,
})

// ============================================================
// SIGNIN - IP RATE LIMITER
// ============================================================
const signinIpRateLimiter = rateLimit({
	// rate-limit window
	windowMs: 10 * 60 * 1000, // 10 minutes

	// maximum login requests from one IP
	limit: 5,

	// send standard RateLimit headers
	standardHeaders: 'draft-8',

	// disable legacy X-RateLimit-* headers
	legacyHeaders: false,

	// response when rate limit is exceeded
	message: {
		message: 'Too many signin attempts. Please try again later.',
		status: 'failed',
	},

	// HTTP status code when rate limit is exceeded
	statusCode: 429,
})

// ============================================================
// VERIFY EMAIL RATE LIMITER
// ============================================================
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

// ============================================================
// RESEND VERIFY EMAIL RATE LIMITER
// ============================================================
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
	signinAccountRateLimiter,
	signinIpRateLimiter,
	verifyEmailRateLimiter,
	resendVerifyEmailRateLimiter,
}