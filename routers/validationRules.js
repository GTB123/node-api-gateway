const { body } = require('express-validator');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const configPath = path.join(__dirname, 'serviceConfigs.yaml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

const generateValidationRules = (serviceName, methodName) => {
  const service = config.services.find(s => s.name === serviceName);
  const method = service.methods.find(m => m.name === methodName);
  const rules = [];

  if (method.validation) {
    Object.keys(method.validation).forEach(field => {
      const { type, required } = method.validation[field];
      let rule = body(field);
      if (type === 'string') rule = rule.isString().withMessage(`${field} must be a string`);
      if (required) rule = rule.notEmpty().withMessage(`${field} is required`);
      rules.push(rule);
    });
  }

  return rules;
};

module.exports = { generateValidationRules };