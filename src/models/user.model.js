/**
	- file name: user.model.js
	- responsibility: responsible for user schema & model design
 */

// importing dependencis
const { Schema, model } = require('mongoose')
const bcrypt = require('bcryptjs')

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
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				'Invalid email address',
			],
			unique: [true, 'Email already exists'],
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			minlength: [6, "Password can't be smaller than 6 characters"],
			select: false,
		},
	},
	{ timestamps: true },
)

// hashing password on modification
userSchema.pre('save', async function (next) {
	// if - password not modified
	if (!this.isModified('password')) {
		return next()
	}

	// if - password modified
	const passwordHash = await bcrypt.hash(this.password, 10)
	this.password = passwordHash
	return next()
})

// method for comparing password
userSchema.methods.comparePassword = async function (password) {
	return await bcrypt.compare(password, this.password)
}

// making model
const userModel = model('user', userSchema)

// exporting model
module.exports = userModel