require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const winston = require('winston');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');
const cors = require('cors');

const { authenticateToken, checkRole } = require('./middleware/auth');

const app = express();

require('./models/EventPerson');

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.use(bodyParser.json());

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

app.use('/users', require('./routes/users'));
app.use('/persons', authenticateToken, require('./routes/persons'));
app.use(
  '/regionals',
  authenticateToken,
  checkRole(['user', 'admin']),
  require('./routes/regionals'),
);
app.use(
  '/commands',
  authenticateToken,
  checkRole(['user', 'admin']),
  require('./routes/commands'),
);
app.use(
  '/divisions',
  authenticateToken,
  checkRole(['user', 'admin']),
  require('./routes/divisions'),
);
app.use(
  '/events',
  authenticateToken,
  checkRole(['user', 'admin']),
  require('./routes/events'),
);
app.use(
  '/charts',
  authenticateToken,
  checkRole(['user', 'admin']),
  require('./routes/charts'),
);
app.use('/reports', require('./routes/reports'));

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));

if (process.env.NODE_ENV !== 'test') {
  sequelize.sync().then(async () => {
    app.listen(process.env.PORT || 3000, () => {
      logger.info('Server is running on port 3000');
    });
  });
} else {
  // In test environment we skip syncing and listening to avoid opening DB connections
}


module.exports = app;
