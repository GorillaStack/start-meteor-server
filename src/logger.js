const LEVELS = [
  'debug',
  'info',
  'warn',
  'error',
  'fatal'
];

const DEFAULT_LOG_LEVEL = 'info';

const getLogger = (options) => {
  options = options || {};
  let output = options.output || console.log;

  if (options.logger) {
    return options.logger;
  }

  let log = {
    logLevel: options.logLevel || DEFAULT_LOG_LEVEL,
    isLogLevelApplicable: (level) => {
      return LEVELS.indexOf(log.logLevel) <= LEVELS.indexOf(level);
    },
    log: (level, params) => {
      if (log.isLogLevelApplicable(level)) {
        output('[' + level + ']: '
          + params.map(param => JSON.stringify(param)).join(', '));
      }
    }
  };

  LEVELS.forEach((level) => {
    log[level] = (...args) => log.log(level, args);
  });

  return log;
};

export default getLogger;
