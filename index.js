
const App = require('./lib/application');
const Router = require('./lib/router');

exports = module.exports = createApplication;

/**
 * Create an express application.
 *
 * @return {Function}
 * @api public
 */
function createApplication() {
  return App();
}

/**
 * Expose constructors.
 */
exports.Router = Router;
