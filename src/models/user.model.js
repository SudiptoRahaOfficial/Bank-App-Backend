/**
	- file name: user.model.js
	- responsibility: responsible for user schema & model design
 */

// importing dependencis
const { Schema, model } = require('mongoose')

// making schema
const userSchema = new Schema(
	{
		name: {
			type: String,
			trim: true,
			required: [true, 'Name is required'],
		},
		email: {
			type: String,
			trim: true,
			required: [true, 'Email is required'],
			lowercase: true,
			match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
			unique: [true, 'Email already exists'],
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			minlength: [6, "Password can't be smaller than 6 characters"],
			select: false,
		},
		verified: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
)

// making model
const userModel = model('user', userSchema)

// exporting model
module.exports = userModel