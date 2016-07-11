class Pipe {
  constructor(stdout, stderr) {
    this.stdout = stdout;
    this.stderr = stderr;
    this.stderr.setEncoding('utf8');
    this.stderr.setEncoding('utf8');

    this.stdout.on('data', (data) => process.stdout.write(data));
    this.stderr.on('data', (data) => process.stderr.write(data));
  }
}

export default Pipe;
