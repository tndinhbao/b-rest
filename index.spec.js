const request = require('supertest');
const assert = require('assert');
const rest = require('./');

describe('Start REST', () => {
  it('Can request /test/api successful', done => {
    const msg = {
      msg: 'Its work! :D'
    };

    let routers = (container, route) => {
      const { greeting } = container;
      route.get('/api', (req, res) => {
        res.status(200).json(greeting());
      });

      return route;
    };

    routers = routers.bind(null, {
      greeting: () => msg
    });

    const serverSettings = {
      baseUrl: '/test',
      serverName: 'test server',
      swagger: {
        document: './swagger.yaml',
        path: '/docs'
      }
    };

    rest(serverSettings, routers).then(app => {
      request
        .agent(app)
        .get('/test/api')
        .expect(res => {
          assert.deepEqual(res.body, msg);
        })
        .expect(200, done);
    });
  });
});
