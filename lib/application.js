/**
 * Module dependencies.
 */

const debug = require('debug')('vnng-rest');
const express = require('express');
const swaggerMiddleware = require('swagger-express-middleware');
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const logger = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const DEFAULT_PATH_DOCS = '/docs';

module.exports = function () {
  const app = express();
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(cors());
  app.use(helmet());

  /**
   * Use swagger
   *
   * @param {Object} option swagger option { document: '', path: '' }
   * @api public
   */
  function swagger(option) {
    if (!option || !option.document) {
      debug('Swagger document not supplied!');
      return app;
    }

    const {
      document = null,
      path = DEFAULT_PATH_DOCS
    } = option;

    const swaggerDocument = YAML.load(document);
    app.use(path, swaggerUI.serve, swaggerUI.setup(swaggerDocument));


    swaggerMiddleware(document, app, (err, middleware) => {
      app.use(middleware.metadata());
      app.use(middleware.CORS());
      app.use(middleware.files());
      app.use(middleware.parseRequest());
      app.use(middleware.validateRequest());
      app.use(middleware.mock());
    });

    return app;
  }

  return Object.assign(app, { swagger });
};
