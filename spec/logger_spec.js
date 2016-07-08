import getLogger from '../src/logger';

describe('logger', () => {
  let log = null;
  let testConsole = {
    count: 0,
    lastMessage: '',
    log: (message) => {
      testConsole.lastMessage = message;
      testConsole.count++;
    }
  };

  beforeAll(() => {
    log = getLogger({
      output: testConsole.log
    });
  });

  it('is defined', () => {
    expect(log).toBeDefined();
  });

  it('.debug is a function', () => {
    expect(typeof log.debug).toBe('function');
  });

  it('.debug does not log for default log level (info)', () => {
    log.debug('message', { key: 'value' });
    expect(testConsole.count).toBe(0);
  });

  it('.info is a function', () => {
    expect(typeof log.info).toBe('function');
  });

  it('.info does log for default log level (info)', () => {
    log.info('message', { key: 'value' });
    expect(testConsole.count).toBe(1);
    expect(testConsole.lastMessage).toBe('[info]: "message", {"key":"value"}');
  });

  it('.warn is a function', () => {
    expect(typeof log.warn).toBe('function');
  });

  it('.error is a function', () => {
    expect(typeof log.error).toBe('function');
  });

  it('.fatal is a function', () => {
    expect(typeof log.fatal).toBe('function');
  });

  describe('isLogLevelApplicable', () => {
    const checkLogLevel = (level, configuredLevel, value) => {
      let logger = getLogger({ logLevel: configuredLevel });
      expect(logger.isLogLevelApplicable(level)).toBe(value);
    };

    it('is true for debug when configured log level is debug', () => checkLogLevel('debug', 'debug', true));
    it('is true for info when configured log level is debug', () => checkLogLevel('info', 'debug', true));
    it('is true for fatal when configured log level is debug', () => checkLogLevel('fatal', 'debug', true));
    it('is false for debug when configured log level is info', () => checkLogLevel('debug', 'info', false));
    it('is true for debug when configured log level is abcdef', () => checkLogLevel('debug', 'abcdef', true));
    it('is false for error when configured log level is fatal', () => checkLogLevel('error', 'fatal', false));
    it('is true for fatal when configured log level is fatal', () => checkLogLevel('fatal', 'fatal', true));
  });
});
