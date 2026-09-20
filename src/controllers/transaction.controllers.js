/**
    - file name: transaction.controllers.js
    - responsibility: responsible for all transaction related api controllers
 */

// importing dependencis
const { startSession } = require('mongoose')
const transactionModel = require('../models/transaction.model')
const ledgerModel = require('../models/ledger.model')
const accountModel = require('../models/account.model')
const {
	sendTransactionSuccessAlertEmail,
} = require('../services/email.service')

/**
    - create transaction controller
    - POST API - "/api/transaction/create-transaction"
 */
async function createTransactionController(req, res) {
	// extracting all data sent by client
	const { fromAccount, toAccount, amount, idempotencyKey } = req.body

	// validating required fields
	if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
		return res.status(400).json({
			message:
				'FromAccount, toAccount, amount & idempotencyKey are required',
			status: 'failed',
		})
	}

	// validating transaction amount
	if (
		typeof amount !== 'number' ||
		!Number.isFinite(amount) ||
		amount <= 99
	) {
		return res.status(400).json({
			message: 'Invalid amount! Minimum transaction amount is 100',
			status: 'failed',
		})
	}

	try {
		// validating fromAccount ownership & toAccount existence
		const [fromUserAccount, toUserAccount] = await Promise.all([
			accountModel
				.findOne({
					_id: fromAccount,
					user: req.user.id,
				})
				.populate('user', 'name email'),

			accountModel.findById(toAccount).populate('user', 'name email'),
		])

		// validating both accounts exists
		if (!fromUserAccount || !toUserAccount) {
			return res.status(400).json({
				message: 'Invalid fromAccount or toAccount',
				status: 'failed',
			})
		}

		// preventing transaction from an account to itself
		if (fromUserAccount._id.equals(toUserAccount._id)) {
			return res.status(400).json({
				message: 'FromAccount and toAccount must be different',
				status: 'failed',
			})
		}

		// validating idempotencyKey
		const isTransactionAlreadyExists = await transactionModel.findOne({
			idempotencyKey,
		})
		if (isTransactionAlreadyExists) {
			if (isTransactionAlreadyExists.status === 'COMPLETED') {
				return res.status(200).json({
					message: 'Transaction processed',
					status: 'success',
					transaction: isTransactionAlreadyExists,
				})
			}
			if (isTransactionAlreadyExists.status === 'PENDING') {
				return res.status(200).json({
					message: 'Transaction pending',
					status: 'pending',
				})
			}
			if (isTransactionAlreadyExists.status === 'FAILED') {
				return res.status(200).json({
					message: 'Transaction failed',
					status: 'failed',
				})
			}
			if (isTransactionAlreadyExists.status === 'REVERSED') {
				return res.status(200).json({
					message: 'Transaction reversed',
					status: 'reversed',
				})
			}
		}

		// validating related both accounts active or not
		if (
			fromUserAccount.status !== 'ACTIVE' ||
			toUserAccount.status !== 'ACTIVE'
		) {
			return res.status(400).json({
				message:
					'Both fromAccount & toAccount must be ACTIVE to process transaction',
				status: 'failed',
			})
		}

		// validating fromUserAccount has sufficient balance
		const fromUserAccountBalance = await fromUserAccount.getAccountBalance()
		if (fromUserAccountBalance < amount) {
			return res.status(400).json({
				message: 'Insufficient balance to make transaction',
				status: 'failed',
			})
		}

		// starting session for transaction
		const transactionSession = await startSession()
		transactionSession.startTransaction()

		// creating transaction - status: pending
		const transaction = await transactionModel.create(
			{
				fromAccount,
				toAccount,
				amount,
				idempotencyKey,
				status: 'PENDING',
			},
			{ session: transactionSession },
		)

		// creating debit-ledger-entry for fromAccount
		const debitLedgerEntry = await ledgerModel.create(
			{
				transaction: transaction._id,
				fromAccount,
				amount,
				type: 'DEBIT',
			},
			{ session: transactionSession },
		)

		// creating credit-ledger-entry for toAccount
		const creditLedgerEntry = await ledgerModel.create(
			{
				transaction: transaction._id,
				toAccount,
				amount,
				type: 'CREDIT',
			},
			{ session: transactionSession },
		)

		// after successful debit & credit updating transaction-status
		transaction.status = 'COMPLETED'
		await transaction.save({ transactionSession })

		// ending transaction session
		await transactionSession.commitTransaction()
		transactionSession.endSession()

		// sending transaction success alert email to - fromAccount user
		await sendTransactionSuccessAlertEmail(
			fromUserAccount.user.email,
			fromUserAccount.user.name,
			transaction._id,
			amount,
			fromUserAccount.currency,
			debitLedgerEntry.type,
		)

		// sending transaction success alert email to - toAccount user
		await sendTransactionSuccessAlertEmail(
			toUserAccount.user.email,
			toUserAccount.user.name,
			transaction._id,
			amount,
			toUserAccount.currency,
			creditLedgerEntry.type,
		)

		// response back on success
		return res.status(201).json({
			message: 'Transaction completed successfully',
			status: 'success',
			transaction,
		})
	} catch (error) {
		// logging on unexpected server error
		console.error('Transaction failed', {
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
	createTransactionController,
}