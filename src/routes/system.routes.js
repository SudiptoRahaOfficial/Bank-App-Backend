/*
    - file name: system.routes.js
    - responsibility: responsible for all system related api endpoints
 */

// importing dependencis
const router = require('express').Router()
const {} = require('../middlewares/auth.middlewares')
const {} = require('../controllers/system.controllers')

// create-system : POST API - "/api/system/create-system"
// router.post('/create-system')

// exporting router
module.exports = router