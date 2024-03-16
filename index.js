var express = require('express');
var app = express();
const cors = require('cors');
var router = require('./routers/router');
var bodyParser = require('body-parser');
var logger = require('./logger');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { v4: uuidv4 } = require('uuid');

var swaggerOptions = require('./swagger');
const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const requestId = uuidv4();
  req.requestId = requestId;
  const originalSend = res.send.bind(res);

  logger.info('REQUEST',{
    method: req.method,
    path: req.path,
    requestId,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  let responseLogged = false;

  res.send = (body) => {
    if (!responseLogged) {
      logger.info('RESPONSE',{
        method: req.method,
        path: req.path,
        requestId,
        statusCode: res.statusCode,
        body: body,
        timestamp: new Date().toISOString()
      });
      responseLogged = true;
    }
    originalSend(body);
  };

  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`PERFORMANCE`, {
      method: req.method,
      path: req.path,
      duration: `${duration} ms`,
      requestId: req.requestId
    });
  });
  next();
});

app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(router);

console.log('Simple API Gateway run on localhost:3000');

app.listen(3000);
