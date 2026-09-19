/**
	- file name: account.model.js
	- responsibility: responsible for account schema & model design
 */

// importing dependencis
const { Schema, model } = require('mongoose')

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

// making model
const accountModel = model('account', accountSchema)

// exporting model
module.exports = accountModel