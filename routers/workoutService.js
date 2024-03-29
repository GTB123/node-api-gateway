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
    const microserviceResponse = await axios.post(targetUrl, req.body);

    const workoutId = microserviceResponse.data.id;

    
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
