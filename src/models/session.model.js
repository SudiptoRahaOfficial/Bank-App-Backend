/*
	- file name: session.model.js
	- responsibility: responsible for session schema & model design
 */

// importing dependencis
const { Schema, model } = require('mongoose')

// making schema
const sessionSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			required: [true, 'User is required'],
		},
		refreshTokenHash: String,
		ip: {
			type: String,
			required: [true, 'IP address is required'],
		},
		userAgent: {
			type: String,
			required: [true, 'User agent is required'],
		},
		revoked: {
			type: Boolean,
			default: false,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
	},
	{ timestamps: true },
)

// session lookup index
sessionSchema.index({ user: 1, revoked: 1 })

// session expiration index
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// making model
const sessionModel = model('session', sessionSchema)

// exporting model
module.exports = sessionModel