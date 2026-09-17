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
} = require('../controllers/auth.controllers')

// signup : POST API - "/api/auth/signup"
router.post('/signup', signupController)

// signin : POST API - "/api/auth/signin"
router.post('/signin', signinController)

// signout : POST API - "/api/auth/signout"
router.post('/signout', signoutController)

// exporting router
module.exports = router