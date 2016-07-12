import { EventEmitter } from 'events';
import { expect } from 'chai';
import _ from 'underscore';
import path from 'path';

import getLogger from './logger';
import defaultOptions from './defaults';
import ChildProcess from './child_process';
import MeteorMongodb from './meteor_mongodb';

class MeteorServer extends EventEmitter {
  constructor(options) {
    super();
    this.logger = getLogger(options);
    this.childProcess = null;
    this.options = _.extend(defaultOptions, options);
    if (!options.logger) {
      this.options.logger = this.logger;
    }

    this.mongodb = null;
    this.buffer = {
      stdout: '',
      stderr: ''
    };
  }

  /**
  * construct environment options for the meteor command based on
  * existing env vars and options
  */
  getEnvironment() {
    let env = _.clone(process.env);
    if (this.options['root-url']) {
      env.ROOT_URL = this.options['root-url'];
    }
    if (this.options['mongo-url']) {
      env.MONGO_URL = this.options['mongo-url'];
    } else if (env.MONGO_URL) {
      delete env.MONGO_URL;
    }

    return env;
  }

  /**
  * returns the command string to be run
  */
  getCommandString() {
    return 'meteor';
  }

  getCommandArgs() {
    return [
      '--port',
      this.options.port
    ];
  }

  startMeteor() {
    this.logger.debug('Meteor.startMeteor()');
    expect(this.childProcess, 'Meteor\'s child process is already running').to.be.null;
    expect(this.options['driver-package'], 'options.driver-package is missing').to.be.ok;

    this.logger.debug('meteor options:', this.options);
    let cwd = path.resolve(this.options.dir);
    this.logger.debug('meteor cwd=' + this.cwd);

    let commandString = this.getCommandString();
    this.logger.debug('meteor command string =', commandString);

    let args = this.getCommandArgs();
    this.logger.debug('meteor command args =', args);

    let env = this.getEnvironment();
    this.logger.debug('meteor env=', env);

    let options = {
      cwd: cwd,
      env: env,
      detached: false
    }

    this.childProcess = new ChildProcess(this.logger);
    this.childProcess.spawn(commandString, args, options);
    this.childProcess.child.on('exit', (code, signal) => {
      this.emit('exit', code, signal);
    });

    this.childProcess.child.stdout.on('data', data => {
      this.buffer.stdout += data;
      this.hasStartedMongoDBText(data);
      this.hasErrorText(data);
      this.hasReadyText(data);
    });

    this.childProcess.child.stderr.on('data', data => {
      this.buffer.stderr += data;
      this.hasErrorText(data);
    });
  }

  hasStartedMongoDBText(buffer) {
    if (buffer.indexOf(this.options['mongodb-ready-text']) > -1) {
      this.logger.info('hasStartedMongoDBText found!');
      this.mongodb = new MeteorMongodb(this.logger, this.childProcess.child.pid);
      this.emit('mongodb ready');
    }
  }

  hasErrorText(buffer) {
    if (buffer.indexOf(this.options['meteor-error-text']) > -1) {
      this.logger.info('hasErrorText found!');
      this.emit('error');
    }
  }

  hasReadyText(buffer) {
    if (buffer.indexOf(this.options['meteor-ready-text']) > -1) {
      this.logger.info('hasReadyText found!');
      this.emit('ready');
    }
  }


  hasMongodb() {
    this.logger.debug('Meteor.hasMongodb()');
    return this.mongodb ? this.mongodb.hasMongodb() : false;
  }


  kill(signal) {
    signal = signal || 'SIGTERM';
    this.logger.debug('Meteor.kill()',
      signal,
      'childProcess?=' + (this.childProcess === null),
      'mongodb?=' + (this.mongodb === null)
    );
    this.childProcess.kill(signal);
    if (this.mongodb) {
      this.mongodb.kill();
    }
    this.emit('killed');
  }

}

export default MeteorServer;
