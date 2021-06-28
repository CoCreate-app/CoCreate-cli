require('./clone.js')
require('./install.js')
require('./link.js')
const spawn = require('../spawn');

spawn('yarn',['start', '-w'])