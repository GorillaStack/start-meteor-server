import log from '../src/log';

describe('log', () => {
  it('is defined', () => {
    expect(log).toBeDefined();
  });

  it('.debug is a function', () => {
    expect(typeof log.debug).toBe('function');
  });

  it('.info is a function', () => {
    expect(typeof log.info).toBe('function');
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
});
