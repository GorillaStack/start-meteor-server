import { EventEmitter } from 'events';
import ps from 'psext';

class MeteorMongodb extends EventEmitter {

  constructor(logger, meteorPid) {
    super();
    this.mongodChildren = [];
    this.killed = false;
    this.logger = logger;
    this.logger.debug('MeteorMongodb.constructor()', logger, meteorPid);
    process.on('exit', code => {
      this.logger.debug('MeteorMongodb.process.on "exit": code=#{code}');
      this.kill();
    });
    this.findAllChildren();
  }

  hasMongodb() {
    this.logger.debug('MeteorMongodb.hasMongodb()');
    return this.mongodChildren.length > 0;
  }

  findAllChildren() {
    this.logger.debug('MeteorMongodb.findAllChildren()');
    this.logger.debug('meteorPid', this.meteorPid);
    ps.lookup({
      command: 'mongod',
      psargs: '-l',
      ppid: this.meteorPid
    }, (err, resultList) => {
      this.mongodChildren = resultList
      if (err) {
        this.logger.warn('Warning: Couldn\'t find any mongod children:\n', err);
      } else if (resultList.length > 1) {
        this.logger.warn('Warning: Found more than one mongod child:\n', resultList);
      } else {
        this.logger.debug('Found meteor mongod child with pid: ', resultList[0].pid);
      }
    });
  }

  kill() {
    this.logger.debug('MeteorMongodb.kill() killed=', this.killed);
    if (this.killed) return;
    this.killed = true;
    let attempts = 1;
    let interval = null;
    onInterval = () => {
      if (attempts <= 40) {
        let signal = attempts < 20 ? 'SIGTERM' : 'SIGKILL';
        this.mongodChildren.forEach(mongod => {
          if (!mongod.dead) {
            try {
              process.kill(mongod.pid, signal);
            } catch (e) {
              mongod.dead = true;
            }
          }
        });

        let allDead = this.mongodChildren.every(mongod => mongod.dead);
        if (allDead) {
          clearInterval(interval);
          this.emit('kill-done', null, this.mongodChildren);
        }
        attempts++;
      } else {
        clearInterval(interval);
        this.logger.error('Error: Unable to kill all mongodb children, even after 40 attempts');
        this.emit('kill-done', new Error('Unable to kill all mongodb children, even after 40 attempts'), this.mongodChildren);
      }
    };

    onInterval();
    interval = setInterval(onInterval, 100);
  }
};

module.exports = MeteorMongodb;
