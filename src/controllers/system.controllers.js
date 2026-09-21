/*
    - file name: system.controllers.js
    - responsibility: responsible for all system related api controllers
 */

// importing dependencis

/**
    - initial fund controller
    - POST API - "/api/system/initial-fund"
 */
async function initialFundController(req, res) {
	// extracting all data sent by client
	const { toAccount, amount, idempotencyKey } = req.body

	// validating required fields
	if (!toAccount || !amount || !idempotencyKey) {
		return res.status(400).json({
			message: 'ToAccount, amount & idempotencyKey are required',
			status: 'failed',
		})
	}

	// validating transaction amount
	if (
		typeof amount !== 'number' ||
		!Number.isFinite(amount) ||
		amount <= 999
	) {
		return res.status(400).json({
			message: 'Invalid amount! Minimum deposit amount is 1000',
			status: 'failed',
		})
	}

	try {
	} catch (error) {}
}

// exporting controllers
module.exports = {
	initialFundController,
}