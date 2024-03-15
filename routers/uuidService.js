var express = require('express');
var router = express.Router();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

const config = yaml.load(fs.readFileSync(path.join(__dirname, 'serviceConfigs.yaml')));

// Find the UUID service configuration
const uuidServiceConfig = config.services.find(service => service.name === 'uuidService');

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

const call = client.Watch({ prefix: 'car' }, { prefix: 'company' });

call.on('data', function (response) {
  // Handle each piece of data received from the stream
  console.log(response);
});

router.post('/uuid', (req, res) => {
  const { prefix } = req.body;
  client.GenerateUUID({ prefix: prefix }, (err, response) => {
    if (!err) {
      res.send(response);
    } else {
      res.status(500).send(err.message);
    }
  });
});

module.exports = router;
