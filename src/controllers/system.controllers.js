/*
    - file name: system.controllers.js
    - responsibility: responsible for all system related api controllers
 */

// importing dependencis
const { startSession } = require('mongoose')
const accountModel = require('../models/account.model')
const userModel = require('../models/user.model')
const transactionModel = require('../models/transaction.model')
const ledgerModel = require('../models/ledger.model')
const {
	sendTransactionSuccessAlertEmail,
} = require('../services/email.service')

/**
    - initial fund controller
    - POST API - "/api/system/initial-fund"
 */
async function initialFundController(req, res) {
	// extracting all data sent by client
	const { receiverAccountId, amount, idempotencyKey } = req.body

	// validating required fields
	if (!receiverAccountId || !amount || !idempotencyKey) {
		return res.status(400).json({
			message: 'ReceiverAccountId, amount & idempotencyKey are required',
			status: 'failed',
		})
	}

	// validating deposit amount
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
		// validating receiver account
		const receiverAccount = await accountModel
			.findOne({ _id: receiverAccountId })
			.populate('user', 'name email')
		if (!receiverAccount) {
			return res.status(400).json({
				message: 'Invalid receiver account',
				status: 'failed',
			})
		}

		// validating system user
		const systemUser = await userModel.findOne({
			_id: req.user.id,
			systemUser: true,
		})
		if (!systemUser) {
			return res.status(400).json({
				message: 'Invalid system user',
				status: 'failed',
			})
		}

		// validating system account
		const systemAccount = await accountModel.findOne({
			user: systemUser._id,
		})
		if (!systemAccount) {
			return res.status(400).json({
				message: 'Invalid system account',
				status: 'failed',
			})
		}

		// preventing transaction from an account to itself
		if (systemAccount._id.equals(receiverAccount._id)) {
			return res.status(400).json({
				message: 'SystemAccount and ReceiverAccount must be different',
				status: 'failed',
			})
		}

		// validating idempotencyKey
		const isDepositAlreadyExists = await transactionModel.findOne({
			idempotencyKey,
		})
		if (isDepositAlreadyExists) {
			if (isDepositAlreadyExists.status === 'COMPLETED') {
				return res.status(200).json({
					message: 'Initial deposit processed',
					status: 'success',
					deposit: isDepositAlreadyExists,
				})
			}
			if (isDepositAlreadyExists.status === 'PENDING') {
				return res.status(200).json({
					message: 'Initial deposit pending',
					status: 'pending',
				})
			}
			if (isDepositAlreadyExists.status === 'FAILED') {
				return res.status(200).json({
					message: 'Initial deposit failed',
					status: 'failed',
				})
			}
			if (isDepositAlreadyExists.status === 'REVERSED') {
				return res.status(200).json({
					message: 'Initial deposit reversed',
					status: 'reversed',
				})
			}
		}

		// validating both accounts active
		if (
			systemAccount.status !== 'ACTIVE' ||
			receiverAccount.status !== 'ACTIVE'
		) {
			return res.status(400).json({
				message: 'Both accounts must be ACTIVE to process',
				status: 'failed',
			})
		}

		// Declaring deposit related core operations
		let deposit
		let debitLedgerEntry
		let creditLedgerEntry

		try {
			// starting session
			const depositSession = await startSession()
			depositSession.startTransaction()

			// creating deposit - status: pending
			deposit = (
				await transactionModel.create(
					[
						{
							fromAccount: systemAccount._id,
							toAccount: receiverAccountId,
							amount,
							idempotencyKey,
							status: 'PENDING',
						},
					],
					{ session: depositSession },
				)
			)[0]

			// creating debit-ledger-entry for systemAccount
			debitLedgerEntry = (
				await ledgerModel.create(
					[
						{
							transaction: deposit._id,
							account: systemAccount._id,
							amount,
							type: 'DEBIT',
						},
					],
					{ session: depositSession },
				)
			)[0]

			// creating credit-ledger-entry for receiverAccount
			creditLedgerEntry = (
				await ledgerModel.create(
					[
						{
							transaction: deposit._id,
							account: receiverAccountId,
							amount,
							type: 'CREDIT',
						},
					],
					{ session: depositSession },
				)
			)[0]

			// after successful debit & credit updating deposit-status
			deposit = await transactionModel.findOneAndUpdate(
				{ _id: deposit._id },
				{ $set: { status: 'COMPLETED' } },
				{ returnDocument: 'after', session: depositSession },
			)

			// closing session
			await depositSession.commitTransaction()
			await depositSession.endSession()
		} catch (depositSessionError) {
			console.error(depositSessionError)

			return res.status(400).json({
				message:
					'Deposit is pending due to some issue, please try after sometime',
				status: 'pending',
			})
		}

		try {
			// sending transaction success alert email receiver
			await sendTransactionSuccessAlertEmail(
				receiverAccount.user.email,
				receiverAccount.user.name,
				deposit._id,
				deposit.amount,
				receiverAccount.currency,
				creditLedgerEntry.type,
			)
		} catch (emailError) {
			console.error('Deposit alert email sending failed', {
				depositId: deposit._id,
				error: emailError.message,
			})
		}

		// response back on success
		return res.status(201).json({
			message: 'Initial deposit completed successfully',
			status: 'success',
			deposit: {
				id: deposit._id,
				receiverAccount: deposit.toAccount,
				amount: deposit.amount,
				idempotencyKey: deposit.idempotencyKey,
				status: deposit.status,
			},
		})
	} catch (error) {
		// logging on unexpected server error
		console.error('Initial deposit failed', {
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
	initialFundController,
}