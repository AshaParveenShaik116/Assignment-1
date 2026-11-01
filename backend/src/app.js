const cors = require('cors');
const express = require('express');
const path = require('node:path');
const OpenApiValidator = require('express-openapi-validator');
const { errorHandler } = require('./middleware/errorHandler');
const { notFoundHandler } = require('./middleware/notFound');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: '100kb' }));
app.use(
  OpenApiValidator.middleware({
    apiSpec: path.resolve(__dirname, '../../specs/001-task-cli-api/contracts/openapi.yaml'),
    validateRequests: true,
    validateResponses: true,
  }),
);
app.use('/api/tasks', taskRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
