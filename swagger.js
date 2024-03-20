const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'TMW API Gateway',
        version: '1.0.0',
        description: 'A simple API Gateway for TMW.',
      },
      servers: [
        {
          url: 'http://localhost:3000',
        },
      ],
    },
    apis: ['./docs/*.yaml'], // Path to the API docs
  };

module.exports = swaggerOptions;