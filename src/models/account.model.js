/**
	- file name: account.model.js
	- responsibility: responsible for account schema & model design
 */

// importing dependencis
const { Schema, model } = require('mongoose')
const ledger = require('../models/ledger.model')
const ledgerModel = require('../models/ledger.model')

// making schema
const accountSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			required: [true, 'Account must be associated with a user'],
			index: true,
		},
		status: {
			type: String,
			enum: {
				values: ['ACTIVE', 'FROZEN', 'CLOSED'],
				message: 'Status can be ACTIVE, FROZEN or CLOSED',
			},
			default: 'ACTIVE',
		},
		currency: {
			type: String,
			required: [true, 'Currency is required for create an account'],
			default: 'BDT',
		},
	},
	{ timestamps: true },
)

// compound index on the basis of user & status
accountSchema.index({ user: 1, status: 1 })

// method for getting account balance
accountSchema.methods.getAccountBalance = async function () {
	// calculating account balance
	const accountBalanceData = await ledgerModel.aggregate([
		{ $match: { account: this._id } },
		{
			$group: {
				_id: null,
				totalDebit: {
					$sum: {
						$cond: [{ $eq: ['type', 'DEBIT'] }, 'amount', 0],
					},
				},
				totalCredit: {
					$sum: {
						$cond: [{ $eq: ['type', 'CREDIT'] }, 'amount', 0],
					},
				},
			},
		},
		{
			$project: {
				_id: 0,
				balance: { $subtract: ['$totalDebit', '$totalCredit'] },
			},
		},
	])

	// checking if account has no balance
	if (accountBalanceData.length === 0) {
		return 0
	}

	// finally returning account balance
	return accountBalanceData[0].balance
}

// making model
const accountModel = model('account', accountSchema)

// exporting model
module.exports = accountModel