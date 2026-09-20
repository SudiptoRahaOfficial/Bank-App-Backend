/**
	- file name: transaction.model.js
	- responsibility: responsible for transaction schema & model design
 */

// importing dependencis
const { Schema, model } = require('mongoose')

// making schema
const transactionSchema = new Schema(
	{
		fromAccount: {
			type: Schema.Types.ObjectId,
			ref: 'account',
			required: [true, 'From account is required for transaction'],
			index: true,
		},
		toAccount: {
			type: Schema.Types.ObjectId,
			ref: 'account',
			required: [true, 'To account is required for transaction'],
			index: true,
		},
		amount: {
			type: Number,
			required: [true, 'Amount is required for transaction'],
			min: [0, 'Transaction amount can not be negative'],
		},
		idempotencyKey: {
			type: String,
			required: [true, 'Idempotency Key is required for transaction'],
			unique: true,
			index: true,
		},
		status: {
			type: String,
			enum: {
				values: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'],
				message:
					'Status can be either PENDING, COMPLETED, FAILED or REVERSED',
			},
			default: 'PENDING',
		},
	},
	{ timestamps: true },
)

// making model
const transactionModel = model('transaction', transactionSchema)

// exporting model
module.exports = transactionModel