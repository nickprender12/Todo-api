//  const { response, request } = require('express');
const logger = require('./logger');

const requestLogger = (request, response, next) => {
  logger.info('Method', request.method);
  logger.info('Path', request.path);
  logger.info('Body', request.body);
  next();
};

// eslint-disable-next-line consistent-return
const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({
      error: 'mal-formatted id',
    });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({
      error: error.message,
    });
  }
  logger.error(error.message);

  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const responseLogged = (request, response, next) => {
  logger.info('Status Code', response.statusCode);
  next();
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7);
  }
  next();
};

module.exports = {
  requestLogger,
  errorHandler,
  unknownEndpoint,
  responseLogged,
  tokenExtractor,
};
