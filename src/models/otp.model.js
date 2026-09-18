/*
 * file name: otp.model.js
 * responsibility: responsible for OTP schema & model design
 */

// importing dependencis
const { Schema, model } = require('mongoose')

// making schema
const otpSchema = new Schema(
	{
		email: {
			type: String,
			required: [true, 'Email is required'],
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			required: [true, 'User is required'],
		},
		otpHash: {
			type: String,
			required: [true, 'OTP hash is required'],
		},
		attempts: {
			type: Number,
			default: 0,
			min: [0, 'OTP attempts cannot be negative'],
			max: [3, 'OTP attempts cannot exceed 3'],
		},
		expiresAt: {
			type: Date,
			required: [true, 'OTP expiration time is required'],
			expires: 0,
		},
	},
	{ timestamps: true },
)

// making model
const otpModel = model('otp', otpSchema)

// exporting model
module.exports = otpModel