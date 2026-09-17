/**
    - file name: auth.routes.js
    - responsibility: responsible for all auth related api endpoints
 */

// importing dependencis
const router = require('express').Router()
const {
	signupController,
	signinController,
} = require('../controllers/auth.controllers')

// signup : POST API - "/api/auth/signup"
router.post('/signup', signupController)

// signin : POST API - "/api/auth/signin"
router.post('/signin', signinController)

// exporting router
module.exports = router