
var express = require('express');
var router = express.Router()
var uuidService = require('./uuidService')
var discoveryService = require('./discoveryService');
var workoutService = require('./workoutService');


router.use((req, res, next) => {
    next()
})

router.use(uuidService)
router.use(discoveryService)
router.use(workoutService)

module.exports = router