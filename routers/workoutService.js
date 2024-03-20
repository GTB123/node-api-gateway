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
const config = yaml.load(
  fs.readFileSync(path.join(__dirname, 'serviceConfigs.yaml'))
);
const workoutServiceConfig = config.services.find(
  (service) => service.name === 'workoutService'
);


/**
 * @swagger
 * /workouts:
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
 * /workouts/{userId}/workout/{workoutId}:
 *   get:
 *     summary: Get a specific workout for a user by workout ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           description: The user ID
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema:
 *           type: string
 *           description: The workout ID
 *     responses:
 *       200:
 *         description: Specific workout details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workout'
 *       500:
 *         description: Error getting the workout
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * /exercise/{exerciseId}/history:
 *   get:
 *     summary: Get exercise history excluding the current workout
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: string
 *           description: The exercise ID
 *     responses:
 *       200:
 *         description: Exercise history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Workout'
 *       500:
 *         description: Error getting exercise history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// POST /workout endpoint
var workoutValidationRules = generateValidationRules(
  'workoutService',
  '/workouts',
  'POST'
);
router.post('/workouts', workoutValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send(errors.array()[0]);
  }

  const targetUrl = `http://${workoutServiceConfig.target}/workout`; // Adjust the URL as needed

  try {
    // Replace this axios.post call with the actual call to your microservice
    // Make sure to send the necessary data in the request
    const microserviceResponse = await axios.post(targetUrl, req.body);

    // Assuming the microservice returns the workout ID in the response
    // and that the response structure is { id: workout.id }
    const workoutId = microserviceResponse.data.id;

    // Send back the workout ID to the client
    res.status(201).send({ id: workoutId });
  } catch (error) {
    console.error(error); // Enhanced error logging
    logger.error('Error creating workout', { error: error.message });
    res.status(500).send({ error: 'Error creating workout' });
  }
});

// GET /workouts/{userId} endpoint
router.get('/workouts/:userId', async (req, res) => {
  const { userId } = req.params;
  const targetUrl = `http://${workoutServiceConfig.target}/workouts/${userId}`;

  try {
    const response = await axios.get(targetUrl, { data: req.body });
    // Log the response data
    res.status(200).send(response.data);
  } catch (error) {
    console.error(error); // Enhanced error logging
    logger.error('Error calling workout service', {
      error: error.message,
      userId
    });
    res.status(500).send({ error: 'Error calling workout service' });
  }
});

// Get /workouts/{userId}/workout/{workoutId} endpoint
router.get('/workouts/:userId/workout/:workoutId', async (req, res) => {
  const { userId, workoutId } = req.params;
  const targetUrl = `http://${workoutServiceConfig.target}/workouts/${userId}/workout/${workoutId}`;

  try {
    const response = await axios.get(targetUrl, { data: req.body });
    res.status(200).send(response.data);
  } catch (error) {
    logger.error('Error calling workout service', {
      error: error.message,
      userId
    });
    res.status(500).send({ error: 'Error calling workout service' });
  }
});

// Get /exercise/{exerciseId}/history endpoint
var workoutValidationRules = generateValidationRules(
  'workoutService',
  '/exercise/:exerciseId/history',
  'GET'
);
router.get(
  '/exercise/:exerciseId/history',
  workoutValidationRules,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send(errors.array()[0]);
    }

    const { exerciseId } = req.params;
    const targetUrl = `http://${workoutServiceConfig.target}/exercise/${exerciseId}/history`;

    try {
      const response = await axios.get(targetUrl, { data: req.body });
      // Log the response data
      res.status(200).send(response.data);
    } catch (error) {
      console.error(error); // Enhanced error logging
      logger.error('Error calling workout service', { error: error.message });
      res.status(500).send({ error: 'Error calling workout service' });
    }
  }
);

module.exports = router;
