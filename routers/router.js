
var express = require('express');
var router = express.Router()
var uuidService = require('./uuidService')
var discoveryService = require('./discoveryService');
const { swaggerDefinition } = require('../swagger');

/**
 * @swagger
 * /:
 *   get:
 *     summary: Returns a simple greeting.
 *     responses:
 *       200:
 *         description: A simple greeting to the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 greeting:
 *                   type: string
 *                   example: Welcome to our API!
 */


router.use((req, res, next) => {
    next()
})

router.use(uuidService)
router.use(discoveryService)

module.exports = router