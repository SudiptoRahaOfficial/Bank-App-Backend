/*
    - file name: system.routes.js
    - responsibility: responsible for all system related api endpoints
 */

// importing dependencis
const router = require('express').Router()
const { authenticateSystemUser } = require('../middlewares/auth.middlewares')
const { initialFundController } = require('../controllers/system.controllers')

// initial-fund : POST API - "/api/system/initial-fund"
router.post('/initial-fund', authenticateSystemUser, initialFundController)

// exporting router
module.exports = router