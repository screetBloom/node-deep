const dts = require('dts-bundle')

dts.bundle({
  name: 'test',
  main: `lib/index.d.ts`,
  out: 'build',
})