var express = require('express');
var router = express.Router();
var logger = require('../logger');
var {  validationResult } = require('express-validator');
const { generateValidationRules } = require('./validationRules');

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

//load config
const config = yaml.load(fs.readFileSync(path.join(__dirname, 'serviceConfigs.yaml')));
const uuidServiceConfig = config.services.find(service => service.name === 'uuidService');
//set up grpc client
const BASE_URL = uuidServiceConfig.target;
const PROTO_PATH = path.resolve(__dirname, uuidServiceConfig.protoPath);
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const uuidProto = grpc.loadPackageDefinition(packageDefinition);
const client = new uuidProto.store.UUID(
  BASE_URL,
  grpc.credentials.createInsecure()
);

/**
 * @swagger
 * components:
 *   schemas:
 *     GenerateUUIDRequest:
 *       type: object
 *       properties:
 *         prefix:
 *           type: string
 *     GenerateUUIDResponse:
 *       type: object
 *       properties:
 *         uuid:
 *           type: string
 *           example: com_qztdLjupDpDiuTBbKPpvO4
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Error generating UUID
 *         prefix:
 *           type: string
 * /uuid:
 *   post:
 *     summary: Generate a UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateUUIDRequest'
 *     responses:
 *       200:
 *         description: A UUID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenerateUUIDResponse'
 *       500:
 *         description: Error generating UUID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */


var uuidValidationRules = generateValidationRules('uuidService', 'GenerateUUID');

// Routes
router.post('/uuid', uuidValidationRules,(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send(errors.array()[0]);
  }

  const { prefix } = req.body;
  client.GenerateUUID({ prefix: prefix }, (err, response) => {
    if (!err) {
      res.send(response);
    } else {
      logger.error('Error generating UUID', { error: err.message, prefix });
      res.status(500).send(err.message);
    }
  });
});

module.exports = router;
