/**
 * Module dependencies.
 */

const debug = require('debug')('b-rest');
const express = require('express');
const spdy = require('spdy');
const swaggerMiddleware = require('swagger-express-middleware');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const logger = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const DEFAULT_PORT = 3000;
const PING_PATH = '/ping';
const DEFAULT_PATH_DOCS = '/docs';

function rest(appSettings = {}, router = r => r) {
  debug('start configuration');
  debug('appSettings= %o', appSettings);
  return new Promise(resolve => {
    const {
      serverName = '',
      baseUrl = '/',
      port = DEFAULT_PORT,
      ssl,
      swagger = {
        document: '',
        path: DEFAULT_PATH_DOCS
      }
    } = appSettings;

    const app = express();
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(cors());
    app.use(helmet());

    app.use(baseUrl, router(express.Router()));

    app.use((err, req, res, next) => {
      if (err) {
        res.status(400).send({
          errorMsg: err.message
        });
      } else next();
    });

    const swaggerDocument = YAML.load(swagger.document);
    app.use(swagger.path, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    swaggerMiddleware(swagger.document, app, (err, middleware) => {
      app.use(middleware.metadata());
      app.use(middleware.CORS());
      app.use(middleware.files());
      app.use(middleware.parseRequest());
      app.use(middleware.validateRequest());
      app.use(middleware.mock());

      app.use(PING_PATH, (req, res) => {
        res.status(200).json({ 'server name': serverName });
      });

      const server = ssl
        ? spdy.createServer(ssl, app).listen(port, () => resolve(server))
        : app.listen(port, () => resolve(server));
    });
  });
}

module.exports = rest;
