
var express = require('express');
var router = express.Router()
var uuidService = require('./uuidService')
var discoveryService = require('./discoveryService');


router.use((req, res, next) => {
    next()
})

router.use(uuidService)
router.use(discoveryService)

module.exports = router