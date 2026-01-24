const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Minha API',
    description: 'Documentação da API',
    version: '1.0.0',
  },
  host: 'localhost:3000',
  schemes: ['http'],
  paths: {},
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./app.js', './routes/users.js', './routes/persons.js', './routes/divisions.js', './routes/events.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
