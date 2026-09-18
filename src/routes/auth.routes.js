/**
    - file name: auth.routes.js
    - responsibility: responsible for all auth related api endpoints
 */

// importing dependencis
const router = require('express').Router()
const {
	signupController,
	signinController,
	signoutController,
	signoutAllController,
	verifyEmailController,
} = require('../controllers/auth.controllers')

// signup : POST API - "/api/auth/signup"
router.post('/signup', signupController)

// signin : POST API - "/api/auth/signin"
router.post('/signin', signinController)

// signout : POST API - "/api/auth/signout"
router.post('/signout', signoutController)

// signout-all : POST API - "/api/auth/signout-all"
router.post('/signout-all', signoutAllController)

// verify-email : POST API - "/api/auth/verify-email"
router.post('/verify-email', verifyEmailController)

// exporting router
module.exports = router