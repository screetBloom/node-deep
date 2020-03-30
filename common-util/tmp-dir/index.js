const path = require('path')
const os = require('os')

const tmpdir = path.join(os.tmpdir(), 'test-dir')
console.log('here >', tmpdir)