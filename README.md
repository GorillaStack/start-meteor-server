# start-meteor-server

[![Build Status](https://travis-ci.org/GorillaStack/start-meteor-server.svg?branch=master)](https://travis-ci.org/GorillaStack/start-meteor-server)

npm module to start a meteor server from code (perfect for acceptance testing)

Inspired by [spacejam](https://www.npmjs.com/package/spacejam) but not coffeescript (thank f***) and more generic.

## example usage

```javascript
// globals_module.js (nightwatch.js example)
MeteorServer = require('start-meteor-server').MeteorServer;

var meteorServer = new MeteorServer({
  logLevel: 'debug', // info by default
  // logger: logger // pass your own logger if you have one :)
  'mongo-url': 'mongodb://localhost:27017/acceptance_tests', // optional (use existing mongodb if one running, otherwise one is started for you)
  port: 5000
});

module.exports = {
  abortOnAssertionFailure : true,
  waitForConditionPollInterval : 300,
  waitForConditionTimeout : 5000,
  throwOnMultipleElementsReturned : true,
  asyncHookTimeout : 10000,
  'default': {
    isLocal: true
  },

  'staging': {
    isLocal: false,
    beforeEach: function() {}
  },

  // Setup - start server and set up fixture data
  before: function(done) {
    // run this only for local environments
    if (this.isLocal) {
      // start the local server
      console.log('starting meteor server');
      meteorServer.startMeteor();
      meteorServer.on('ready', () => {
        console.log('started meteor server');
        done();
      });
    } else {
      done();
    }
  },

  // Teardown - delete all data, stop server
  after: function(done) {
    // run this only for local environments
    if (this.isLocal) {
      // start the local server
      console.log('stopping meteor server');
      meteorServer.kill();
      meteorServer.on('killed', () => {
        console.log('stopped meteor server');
        done();
      });
    } else {
      done();
    }
    done();
  },

  beforeEach: function(browser, done) { done(); },
  afterEach: function(browser, done) { done(); },
};

```
