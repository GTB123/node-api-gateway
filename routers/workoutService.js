var express = require('express');
var router = express.Router();
var axios = require('axios');

var logger = require('../logger');
var { validationResult } = require('express-validator');
const { generateValidationRules } = require('./validationRules');

// Load configuration
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const config = yaml.load(fs.readFileSync(path.join(__dirname, 'serviceConfigs.yaml')));
const workoutServiceConfig = config.services.find(service => service.name === 'workoutService');

// Define validation rules
var workoutValidationRules = generateValidationRules('workoutService', 'POST');

//write the swagger docs

/**
 * @swagger
 * components:
 *   schemas:
 *     Workout:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: The user ID
 *         workout:
 *           type: string
 *           description: The workout details
 *       required:
 *         - userId
 *         - workout
 *     WorkoutResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Workout created successfully
 *       required:
 *         - message
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Error creating workout
 * /workout:
 *   post:
 *     summary: Create a workout
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Workout'
 *     responses:
 *       201:
 *         description: Workout created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkoutResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error creating workout
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * /workouts/{userId}:
 *   get:
 *     summary: Get workouts for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           description: The user ID
 *     responses:
 *       200:
 *         description: A list of workouts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Workout'
 *       500:
 *         description: Error getting workouts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// POST /workout endpoint
router.post('/workout', workoutValidationRules, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send(errors.array()[0]);
  }

  // Implement your logic here
  // For example, save the workout data to a database

  res.status(201).send({ message: 'Workout created successfully' });
});

// GET /workouts/{userId} endpoint
router.get('/workouts/:userId', async (req, res) => {
    const { userId } = req.params;
    const targetUrl = `http://${workoutServiceConfig.target}/workouts/${userId}`;
    console.log(targetUrl);
  
    try {
        const response = await axios.get(targetUrl);
         // Log the response data
        res.status(200).send(response.data);
      } catch (error) {
        console.error(error); // Enhanced error logging
        logger.error('Error calling workout service', { error: error.message, userId });
        res.status(500).send({ error: 'Error calling workout service' });
      }
  });

module.exports = router;