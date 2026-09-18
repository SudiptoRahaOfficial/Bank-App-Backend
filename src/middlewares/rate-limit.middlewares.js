/**
    - file name: rate-limit.middlewares.js
    - responsibility: responsible for API rate limiting
 */

// importing dependencies
const { rateLimit } = require('express-rate-limit')

/**
    - middleware : routeRateLimiter
    - for : rate-limit indivisual routes
 */
const routeRateLimiter = rateLimit({
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
		message: 'Attempts limits over. Please try later.',
		status: 'failed',
	},

	// HTTP status code when rate limit is exceeded
	statusCode: 429,
})

// exporting middlewares
module.exports = {
	routeRateLimiter,
}