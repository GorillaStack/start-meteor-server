
const LEVELS = [
  'debug',
  'info',
  'warn',
  'error',
  'fatal'
];

let log = {
  log: (level, params) => {
    console.log('[' + level + ']: '
      + params.map(param => JSON.stringify(param)).join(', '));
  }
};

LEVELS.forEach((level) => {
  log[level] = (...args) => log.log(level, args);
});

export default log;
