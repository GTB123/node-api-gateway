
var express = require('express');
var router = express.Router()
var uuidService = require('./uuidService')
var discoveryService = require('./discoveryService')


router.use((req, res, next) => {
    console.log("Called: ", req.path)
    next()
})

router.use(uuidService)
router.use(discoveryService)

module.exports = router