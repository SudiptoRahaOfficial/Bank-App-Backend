/*
 * file name: email.service.js
 * responsibility: responsible for email services
 */

// importing dependencis
const nodemailer = require('nodemailer')
const config = require('../config/env.config')

// configuring transporter
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		type: 'OAuth2',
		user: config.GOOGLE_USER,
		clientId: config.GOOGLE_CLIENT_ID,
		clientSecret: config.GOOGLE_CLIENT_SECRET,
		refreshToken: config.GOOGLE_REFRESH_TOKEN,
	},
})

// Verify the connection configuration
transporter.verify((error) => {
	if (error) {
		console.error('Error connecting to email server:', error)
	} else {
		console.log('Email server is ready to send messages')
	}
})

// Function to send email
const sendEmail = async (to, subject, text, html) => {
	try {
		const info = await transporter.sendMail({
			from: `"Bank App Backend" <${config.GOOGLE_USER}>`, // sender address
			to, // list of receivers
			subject, // Subject line
			text, // plain text body
			html, // html body
		})

		console.log('Message sent: %s', info.messageId)
		return info
	} catch (error) {
		console.error('Error sending email:', error)
		throw error
	}
}

/**
    - some functions for sending auto emails
        - signup email
        - signin email
        - OTP verification email
 */
// function for sending email on new user signup
async function sendSignupEmail(userEmail, userName, otp) {
	const subject = 'Welcome to Bank App Backend'

	const text = `Hello ${userName},

Thank you for joining at Bank App Backend. We're excited to have you on board!

Your verification code for Bank App Backend is: ${otp}

This code will expire in next 3 minutes. Verify your account with this code to get full access. 

For your security, do not share this verification code with anyone.

Best regards,
The Bank App Backend Team`

	const html = `<p>Hello ${userName},</p>
<p>Thank you for joining at Bank App Backend. We're excited to have you on board!</p>
<p>Your verification code for Bank App Backend is:</p>
<p><strong>${otp}</strong></p>
<p>This code will expire in next 3 minutes. Verify your account with this code to get full access.</p>
<p>For your security, do not share this verification code with anyone.</p>
<p>Best regards,<br/>The Bank App Backend Team</p>`

	await sendEmail(userEmail, subject, text, html)
}

// function for sending email on user signin
async function sendSigninEmail(userEmail, userName) {
	const subject = 'New Sign-In to Bank App Backend'

	const text = `Hello ${userName},

We detected a new sign-in to your Bank App Backend account.

If this sign-in was performed by you, no further action is required.

If you did not sign in to your account, please secure your account immediately and contact support if necessary.

Best regards,
The Bank App Backend Team`

	const html = `<p>Hello ${userName},</p>
<p>We detected a new sign-in to your Bank App Backend account.</p>
<p>If this sign-in was performed by you, no further action is required.</p>
<p>If you did not sign in to your account, please secure your account immediately and contact support if necessary.</p>
<p>Best regards,<br/>The Bank App Backend Team</p>`

	await sendEmail(userEmail, subject, text, html)
}

// function for sending OTP email
async function sendOTPEmail(userEmail, userName, otp) {
	const subject = 'Your Verification Code - Bank App Backend'

	const text = `Hello ${userName},

Your verification code for Bank App Backend is: ${otp}

This code will expire in next 3 minutes. For your security, do not share this verification code with anyone.

If you did not request this verification code, please ignore this email and secure your account if necessary.

Best regards,
The Bank App Backend Team`

	const html = `<p>Hello ${userName},</p>
<p>Your verification code for Bank App Backend is:</p>
<p><strong>${otp}</strong></p>
<p>This code will expire in next 3 minutes. For your security, do not share this verification code with anyone.</p>
<p>If you did not request this verification code, please ignore this email and secure your account if necessary.</p>
<p>Best regards,<br/>The Bank App Backend Team</p>`

	await sendEmail(userEmail, subject, text, html)
}

// exporting email sending functions
module.exports = {
	sendSignupEmail,
	sendSigninEmail,
	sendOTPEmail,
}