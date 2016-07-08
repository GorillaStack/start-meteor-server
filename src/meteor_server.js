import getLogger from './logger';
import defaults from './defaults';

class MeteorServer {
  constructor(options) {
    this.logger = getLogger(options);
  }

}

export default MeteorServer;
