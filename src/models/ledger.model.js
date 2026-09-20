/*
	- file name: ledger.model.js
	- responsibility: responsible for ledger schema & model design
 */

// importing dependencis
const { Schema, model } = require('mongoose')

// making schema
const ledgerSchema = new Schema(
	{
		transaction: {
			type: Schema.Types.ObjectId,
			ref: 'transaction',
			required: [true, 'Ledger must be associated with a transaction'],
			immutable: true,
			index: true,
		},
		account: {
			type: Schema.Types.ObjectId,
			ref: 'account',
			required: [true, 'Ledger must be associated with an account'],
			immutable: true,
			index: true,
		},
		amount: {
			type: Number,
			required: [true, 'Amount is required for creating ledger entry'],
			immutable: true,
		},
		type: {
			type: String,
			enum: {
				values: ['CREDIT', 'DEBIT'],
				message: 'Type can be either CREDIT or DEBIT',
			},
			required: [true, 'Ledger type is required'],
			immutable: true,
		},
	},
	{ timestamps: true },
)

// function for preventing ledger modification
function preventLedgerModification() {
	throw new Error(
		'Ledger entries are immutable and can not be updated or deleted',
	)
}
// modification actions will throw error
ledgerSchema.pre('findByIdAndUpdate', preventLedgerModification)
ledgerSchema.pre('findByIdAndDelete', preventLedgerModification)
ledgerSchema.pre('findByIdAndRemove', preventLedgerModification)
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification)
ledgerSchema.pre('findOneAndDelete', preventLedgerModification)
ledgerSchema.pre('findOneAndReplace', preventLedgerModification)
ledgerSchema.pre('updateOne', preventLedgerModification)
ledgerSchema.pre('updateMany', preventLedgerModification)
ledgerSchema.pre('deleteOne', preventLedgerModification)
ledgerSchema.pre('deleteMany', preventLedgerModification)
ledgerSchema.pre('replaceOne', preventLedgerModification)

// making model
const ledgerModel = model('ledger', ledgerSchema)

// exporting model
module.exports = ledgerModel