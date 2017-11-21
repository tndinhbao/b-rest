const request = require('supertest');
const assert = require('assert');
const rest = require('./');

describe('Start REST', () => {
  it('Can request /test/api successful', done => {
    const msg = {
      msg: 'Its work! :D'
    };

    // Controller
    let routers = (container, route) => {
      const { greeting } = container;
      route.get('/api', (req, res) => {
        res.status(200).json(greeting());
      });

      return route;
    };

    // Inverse of control
    routers = routers.bind(null, {
      greeting: () => msg
    });

    const app = rest();

    // Swagger
    app.swagger({
      document: './swagger.yaml',
      path: '/docs'
    });

    // routers
    app.use('/test', routers(rest.Router()));
    
    // Start
    app.listen(3000);

    request
      .agent(app)
      .get('/test/api')
      .expect(res => {
        assert.deepEqual(res.body, msg);
      })
      .expect(200, done);
  });
});
