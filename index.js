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
  const originalSend = res.send.bind(res);

  logger.info(`Request: ${req.method} ${req.path}`, {
    requestId,
    body: req.body
  });

  let responseLogged = false;

  res.send = (body) => {
    if (!responseLogged) {
      logger.info(`Response: ${req.method} ${req.path}`, {
        requestId,
        statusCode: res.statusCode,
        body: body
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
    logger.info(`Request processed in ${duration}ms`, {
      path: req.path,
      duration
    });
  });
  next();
});

app.get('/', (req, res) => {
  res.send('Simple API Gateway');
});

app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(router);



console.log('Simple API Gateway run on localhost:3000');

app.listen(3000);
