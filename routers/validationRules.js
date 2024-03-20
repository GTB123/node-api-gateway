const { body } = require('express-validator');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const configPath = path.join(__dirname, 'serviceConfigs.yaml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

const generateValidationRules = (serviceName, routePath, methodName) => {
  const service = config.services.find((s) => s.name === serviceName);

  const route = service.routes.find((r) => r.path === routePath);
  const method = route.methods.find((m) => m.name === methodName);
  const rules = [];

  if (method.request) {
    Object.keys(method.request).forEach((field) => {
      const type = method.request[field];
      let rule = body(field);
      if (type === 'string')
        rule = rule.isString().withMessage(`${field} must be a string`);
      rule = rule.notEmpty().withMessage(`${field} is required`);
      rules.push(rule);
    });
  }

  return rules;
};

module.exports = { generateValidationRules };
