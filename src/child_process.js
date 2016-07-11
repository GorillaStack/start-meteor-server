import { expect } from 'chai';
import path from 'path';
import { spawn, exec } from 'child_process';
import Pipe from './pipe';

class ChildProcess {

  // # Design for testability - so we can spy on them / stub them in tests
  constructor(logger) {
    this.logger = logger;
    this.logger.debug('ChildProcess.constructor()');

    this.child = null;
    this.descendants = [];
    this.pipe = null;
    this.command = null;
    this.killed = false;
    this._spawn = spawn;
    this._exec = exec;
  }

  exec(commandString, options, cb) {
    this.logger.debug('ChildProcess.exec()', commandString, cb);
    options = options || {};
    cb = cb || function() {};
    expect(this.child).to.be.null;
    expect(commandString).to.be.a('string').that.is.ok;
    expect(options).to.be.an('object');
    expect(cb).to.be.a('function');

    this.command = path.basename(command);
    innerCB = (err, stdout, stderr) => {
      this.killed = true
      if (err) {
        this.logger.error('child_process.exec: Error: #{this.command} exit code: #{err.code} termination signal: #{err.signal}');
      }

      cb(err, stdout, stderr);
    }

    this.child = this._exec(command, options, innerCB);
    this.child.stdout.pipe(process.stdout)
    this.child.stderr.pipe(process.stderr)
  }

  spawn(commandString, args, options, pipeClass, pipeClassOptions) {
    args = args || [];
    options = options || {};

    this.logger.debug('ChildProcess.spawn()', commandString, args);
    expect(this.child, 'ChildProcess is already running').to.be.null;
    expect(commandString, 'Invalid commandString argument').to.be.a('string');
    expect(args, 'Invalid args argument').to.be.an('array');
    expect(options, 'Invalid options').to.be.an('object');
    if (pipeClass)
      expect(pipeClass, 'Invalid pipeClass').to.be.a('function');
    if (pipeClassOptions)
      expect(pipeClassOptions, 'Invalid pipeClassOptions').to.be.an('object');

    this.command = path.basename(commandString);

    this.logger.info('spawning #{this.command}');

    process.on('exit', (code) => {
      this.logger.debug('ChildProcess.process.on "exit": @command=#{this.command} @killed=#{this.killed} code=#{code}');
      this.kill();
    });

    this.child = this._spawn(commandString, args, options);

    if (pipeClass) {
      this.pipe = new pipeClass(this.child.stdout, this.child.stderr, pipeClassOptions);
    } else {
      this.pipe = new Pipe(this.child.stdout, this.child.stderr);
    }

    this.child.on('exit', (code, signal) => {
      this.logger.debug('ChildProcess.process.on "exit": @command=#{this.command} @killed=#{this.killed} code=#{code} signal=#{signal}');
      this.killed = true
      if (code) {
        this.logger.info('#{commandString} exited with code: #{code}');
      } else if (signal) {
        this.logger.info('#{commandString} killed with signal: #{signal}');
      } else {
        this.logger.error('#{commandString} exited with arguments: #{arguments}');
      }
    });
  }

  kill(signal) {
    signal = signal || 'SIGTERM';

    this.logger.debug('ChildProcess.kill() signal=#{signal} @command=#{this.command} @killed=#{this.killed}');
    if (this.killed) {
      return;
    }
    this.logger.info('killing', this.command);
    this.killed = true;
    try {
      // # Providing a negative pid will kill the entire process group,
      // # i.e. the process and all it's children
      // # See man kill for more info
      // #process.kill(-@child.pid, signal)

      if (this.child) {
        this.child.kill(signal);
      }
    } catch (err) {
      this.logger.warn('Error: While killing #{this.command} with pid #{@child.pid}:\n', err);
    }
  }
}

export default ChildProcess;
