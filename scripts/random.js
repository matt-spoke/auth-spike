// eslint-disable-next-line @typescript-eslint/no-require-imports
var randomBytes = require('randombytes');
const key = randomBytes(32).toString('hex');
console.log(key);