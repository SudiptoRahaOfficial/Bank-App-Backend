/**
    - file name: auth.routes.js
    - responsibility: responsible for all auth related api endpoints
 */

// importing dependencis
const router = require('express').Router()
const { signupController } = require('../controllers/auth.controllers')

// signup : POST API - "/api/auth/signup"
router.post('/signup', signupController)

// exporting router
module.exports = router