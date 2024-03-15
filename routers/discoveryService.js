var express = require('express');
var router = express.Router();

router.get('/discover', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const yaml = require('js-yaml');

    // Load service configurations
    const configPath = path.join(__dirname, 'serviceConfigs.yaml');
    const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

    // Filter out sensitive information like API keys
    const services = config.services.map(({ name, type, target, methods}) => ({ name, type, target, methods }));

    res.json(services);
});
  
module.exports = router;