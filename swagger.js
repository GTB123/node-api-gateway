const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Simple API Gateway',
        version: '1.0.0',
        description: 'A simple API Gateway example',
      },
      servers: [
        {
          url: 'http://localhost:3000',
        },
      ],
    },
    apis: ['./routers/*.js'], // Path to the API docs
  };

module.exports = swaggerOptions;