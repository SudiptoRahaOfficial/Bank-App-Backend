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

	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f4f7fb;
    font-family: Arial, Helvetica, sans-serif;
    color: #1f2937;
">

    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background-color: #f4f7fb; padding: 40px 15px;"
    >
        <tr>
            <td align="center">

                <!-- Main Container -->
                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        max-width: 560px;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
                    "
                >

                    <!-- Header -->
                    <tr>
                        <td
                            align="center"
                            style="
                                background-color: #0f172a;
                                padding: 28px 30px;
                            "
                        >
                            <h1 style="
                                margin: 0;
                                color: #ffffff;
                                font-size: 24px;
                                font-weight: 700;
                                letter-spacing: 0.3px;
                            ">
                                Bank App Backend
                            </h1>

                            <p style="
                                margin: 8px 0 0;
                                color: #cbd5e1;
                                font-size: 14px;
                            ">
                                Secure Account Verification
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 38px 35px;">

                            <p style="
                                margin: 0 0 18px;
                                font-size: 16px;
                                line-height: 1.6;
                            ">
                                Hello <strong>${userName}</strong>,
                            </p>

                            <p style="
                                margin: 0 0 18px;
                                font-size: 15px;
                                line-height: 1.7;
                                color: #4b5563;
                            ">
                                Thank you for joining <strong>Bank App Backend</strong>.
                                We're excited to have you on board!
                            </p>

                            <p style="
                                margin: 0 0 10px;
                                font-size: 15px;
                                line-height: 1.7;
                                color: #4b5563;
                            ">
                                To complete your account verification, please use the
                                verification code below:
                            </p>

                            <!-- OTP Box -->
                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="margin: 28px 0;"
                            >
                                <tr>
                                    <td
                                        align="center"
                                        style="
                                            background-color: #f8fafc;
                                            border: 1px solid #e2e8f0;
                                            border-radius: 10px;
                                            padding: 24px 15px;
                                        "
                                    >
                                        <p style="
                                            margin: 0 0 8px;
                                            font-size: 12px;
                                            color: #64748b;
                                            text-transform: uppercase;
                                            letter-spacing: 1.5px;
                                            font-weight: 600;
                                        ">
                                            Verification Code
                                        </p>

                                        <p style="
                                            margin: 0;
                                            font-size: 34px;
                                            line-height: 1.2;
                                            font-weight: 700;
                                            letter-spacing: 8px;
                                            color: #0f172a;
                                        ">
                                            ${otp}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Expiration Notice -->
                            <p style="
                                margin: 0 0 20px;
                                padding: 14px 16px;
                                background-color: #fff7ed;
                                border-left: 4px solid #f97316;
                                border-radius: 4px;
                                font-size: 14px;
                                line-height: 1.6;
                                color: #9a3412;
                            ">
                                <strong>⏱ This code expires in 3 minutes.</strong><br>
                                Please verify your account before the code expires.
                            </p>

                            <!-- Security Notice -->
                            <p style="
                                margin: 0 0 24px;
                                padding: 14px 16px;
                                background-color: #f0fdf4;
                                border-left: 4px solid #22c55e;
                                border-radius: 4px;
                                font-size: 14px;
                                line-height: 1.6;
                                color: #166534;
                            ">
                                <strong>Security notice:</strong><br>
                                Never share this verification code with anyone.
                                Our team will never ask you for this code.
                            </p>

                            <p style="
                                margin: 0;
                                font-size: 15px;
                                line-height: 1.7;
                                color: #4b5563;
                            ">
                                If you did not create this account, you can safely
                                ignore this email.
                            </p>

                            <p style="
                                margin: 28px 0 0;
                                font-size: 15px;
                                line-height: 1.6;
                                color: #374151;
                            ">
                                Best regards,<br>
                                <strong>The Bank App Backend Team</strong>
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                            align="center"
                            style="
                                background-color: #f8fafc;
                                border-top: 1px solid #e5e7eb;
                                padding: 20px 30px;
                            "
                        >
                            <p style="
                                margin: 0;
                                font-size: 12px;
                                line-height: 1.6;
                                color: #94a3b8;
                            ">
                                This is an automated message. Please do not reply
                                to this email.
                            </p>

                            <p style="
                                margin: 6px 0 0;
                                font-size: 12px;
                                color: #94a3b8;
                            ">
                                © ${new Date().getFullYear()} Bank App Backend
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
`

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

	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Sign-In Alert</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f4f7fb;
    font-family: Arial, Helvetica, sans-serif;
    color: #1f2937;
">

    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background-color: #f4f7fb; padding: 40px 15px;"
    >
        <tr>
            <td align="center">

                <!-- Main Container -->
                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        max-width: 560px;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
                    "
                >

                    <!-- Header -->
                    <tr>
                        <td
                            align="center"
                            style="
                                background-color: #0f172a;
                                padding: 28px 30px;
                            "
                        >
                            <h1 style="
                                margin: 0;
                                color: #ffffff;
                                font-size: 24px;
                                font-weight: 700;
                                letter-spacing: 0.3px;
                            ">
                                Bank App Backend
                            </h1>

                            <p style="
                                margin: 8px 0 0;
                                color: #cbd5e1;
                                font-size: 14px;
                            ">
                                Account Security Alert
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 38px 35px;">

                            <p style="
                                margin: 0 0 18px;
                                font-size: 16px;
                                line-height: 1.6;
                            ">
                                Hello <strong>${userName}</strong>,
                            </p>

                            <!-- Sign-in Alert -->
                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="margin: 0 0 25px;"
                            >
                                <tr>
                                    <td
                                        align="center"
                                        style="
                                            background-color: #f8fafc;
                                            border: 1px solid #e2e8f0;
                                            border-radius: 10px;
                                            padding: 24px 15px;
                                        "
                                    >
                                        <p style="
                                            margin: 0 0 10px;
                                            font-size: 13px;
                                            color: #64748b;
                                            text-transform: uppercase;
                                            letter-spacing: 1.5px;
                                            font-weight: 600;
                                        ">
                                            New Sign-In Detected
                                        </p>

                                        <p style="
                                            margin: 0;
                                            font-size: 17px;
                                            line-height: 1.5;
                                            font-weight: 600;
                                            color: #0f172a;
                                        ">
                                            🔐 A new sign-in was detected
                                            on your account.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="
                                margin: 0 0 18px;
                                font-size: 15px;
                                line-height: 1.7;
                                color: #4b5563;
                            ">
                                We detected a new sign-in to your
                                <strong>Bank App Backend</strong> account.
                            </p>

                            <p style="
                                margin: 0 0 24px;
                                font-size: 15px;
                                line-height: 1.7;
                                color: #4b5563;
                            ">
                                If this sign-in was performed by you,
                                <strong>no further action is required.</strong>
                            </p>

                            <!-- Security Warning -->
                            <p style="
                                margin: 0 0 24px;
                                padding: 16px;
                                background-color: #fef2f2;
                                border-left: 4px solid #ef4444;
                                border-radius: 4px;
                                font-size: 14px;
                                line-height: 1.7;
                                color: #991b1b;
                            ">
                                <strong>⚠️ Didn't sign in?</strong><br>
                                If you did not sign in to your account, please
                                secure your account immediately and contact
                                support if necessary.
                            </p>

                            <p style="
                                margin: 0;
                                font-size: 14px;
                                line-height: 1.7;
                                color: #64748b;
                            ">
                                For your security, we recommend reviewing your
                                account activity if you don't recognize this
                                sign-in.
                            </p>

                            <p style="
                                margin: 28px 0 0;
                                font-size: 15px;
                                line-height: 1.6;
                                color: #374151;
                            ">
                                Best regards,<br>
                                <strong>The Bank App Backend Team</strong>
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                            align="center"
                            style="
                                background-color: #f8fafc;
                                border-top: 1px solid #e5e7eb;
                                padding: 20px 30px;
                            "
                        >
                            <p style="
                                margin: 0;
                                font-size: 12px;
                                line-height: 1.6;
                                color: #94a3b8;
                            ">
                                This is an automated security notification.
                                Please do not reply to this email.
                            </p>

                            <p style="
                                margin: 6px 0 0;
                                font-size: 12px;
                                color: #94a3b8;
                            ">
                                © ${new Date().getFullYear()} Bank App Backend
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
`

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

	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f4f7fb;
    font-family: Arial, Helvetica, sans-serif;
    color: #1f2937;
">

    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background-color: #f4f7fb; padding: 40px 15px;"
    >
        <tr>
            <td align="center">

                <!-- Main Container -->
                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        max-width: 560px;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
                    "
                >

                    <!-- Header -->
                    <tr>
                        <td
                            align="center"
                            style="
                                background-color: #0f172a;
                                padding: 28px 30px;
                            "
                        >
                            <h1 style="
                                margin: 0;
                                color: #ffffff;
                                font-size: 24px;
                                font-weight: 700;
                                letter-spacing: 0.3px;
                            ">
                                Bank App Backend
                            </h1>

                            <p style="
                                margin: 8px 0 0;
                                color: #cbd5e1;
                                font-size: 14px;
                            ">
                                Email Verification
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 38px 35px;">

                            <p style="
                                margin: 0 0 18px;
                                font-size: 16px;
                                line-height: 1.6;
                            ">
                                Hello <strong>${userName}</strong>,
                            </p>

                            <p style="
                                margin: 0 0 18px;
                                font-size: 15px;
                                line-height: 1.7;
                                color: #4b5563;
                            ">
                                Your verification code for
                                <strong>Bank App Backend</strong> is:
                            </p>

                            <!-- OTP Box -->
                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="margin: 28px 0;"
                            >
                                <tr>
                                    <td
                                        align="center"
                                        style="
                                            background-color: #f8fafc;
                                            border: 1px solid #e2e8f0;
                                            border-radius: 10px;
                                            padding: 24px 15px;
                                        "
                                    >
                                        <p style="
                                            margin: 0 0 8px;
                                            font-size: 12px;
                                            color: #64748b;
                                            text-transform: uppercase;
                                            letter-spacing: 1.5px;
                                            font-weight: 600;
                                        ">
                                            Verification Code
                                        </p>

                                        <p style="
                                            margin: 0;
                                            font-size: 34px;
                                            line-height: 1.2;
                                            font-weight: 700;
                                            letter-spacing: 8px;
                                            color: #0f172a;
                                        ">
                                            ${otp}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Expiration Notice -->
                            <p style="
                                margin: 0 0 20px;
                                padding: 14px 16px;
                                background-color: #fff7ed;
                                border-left: 4px solid #f97316;
                                border-radius: 4px;
                                font-size: 14px;
                                line-height: 1.6;
                                color: #9a3412;
                            ">
                                <strong>⏱ This code expires in 3 minutes.</strong><br>
                                Please complete your verification before the
                                code expires.
                            </p>

                            <!-- Security Notice -->
                            <p style="
                                margin: 0 0 24px;
                                padding: 14px 16px;
                                background-color: #f0fdf4;
                                border-left: 4px solid #22c55e;
                                border-radius: 4px;
                                font-size: 14px;
                                line-height: 1.6;
                                color: #166534;
                            ">
                                <strong>Security notice:</strong><br>
                                Never share this verification code with anyone.
                                Our team will never ask you for this code.
                            </p>

                            <!-- Unexpected Request -->
                            <p style="
                                margin: 0;
                                font-size: 14px;
                                line-height: 1.7;
                                color: #64748b;
                            ">
                                If you did not request this verification code,
                                please ignore this email and secure your account
                                if necessary.
                            </p>

                            <p style="
                                margin: 28px 0 0;
                                font-size: 15px;
                                line-height: 1.6;
                                color: #374151;
                            ">
                                Best regards,<br>
                                <strong>The Bank App Backend Team</strong>
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                            align="center"
                            style="
                                background-color: #f8fafc;
                                border-top: 1px solid #e5e7eb;
                                padding: 20px 30px;
                            "
                        >
                            <p style="
                                margin: 0;
                                font-size: 12px;
                                line-height: 1.6;
                                color: #94a3b8;
                            ">
                                This is an automated message. Please do not reply
                                to this email.
                            </p>

                            <p style="
                                margin: 6px 0 0;
                                font-size: 12px;
                                color: #94a3b8;
                            ">
                                © ${new Date().getFullYear()} Bank App Backend
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
`

	await sendEmail(userEmail, subject, text, html)
}

// exporting email sending functions
module.exports = {
	sendSignupEmail,
	sendSigninEmail,
	sendOTPEmail,
}