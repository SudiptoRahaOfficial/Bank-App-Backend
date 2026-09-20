/**
    - file name: transaction.controllers.js
    - responsibility: responsible for all transaction related api controllers
 */

// importing dependencis
const { startSession } = require('mongoose')
const transactionModel = require('../models/transaction.model')
const ledgerModel = require('../models/ledger.model')
const accountModel = require('../models/account.model')

/**
    - create transaction controller
    - POST API - "/api/transaction/create-transaction"
 */
async function createTransaction(req, res) {
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

	try {
		// validating fromUser & toUser both account exists
		const fromUserAccount = await accountModel.findOne({ _id: fromAccount })
		const toUserAccount = await accountModel.findOne({ _id: toAccount })
		if (!fromUserAccount || !toUserAccount) {
			return res.status(400).json({
				message: 'Invalid fromAccount or toAccount',
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
			{ transactionSession },
		)

		// creating debit-ledger-entry for fromAccount
		const debitLedgerEntry = await ledgerModel.create(
			{
				transaction: transaction._id,
				fromAccount,
				amount,
				type: 'DEBIT',
			},
			{ transactionSession },
		)

		// creating credit-ledger-entry for toAccount
		const creditLedgerEntry = await ledgerModel.create(
			{
				transaction: transaction._id,
				toAccount,
				amount,
				type: 'CREDIT',
			},
			{ transactionSession },
		)

		// after successful debit & credit updating transaction-status
		transaction.status = 'COMPLETED'
		await transaction.save({ transactionSession })

        // ending transaction session
        await transactionSession.commitTransaction()
        transactionSession.endSession()
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
	createTransaction,
}