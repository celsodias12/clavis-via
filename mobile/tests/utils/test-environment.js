// Jest environment for the Expo native preset that also remembers Node's own fetch API.
// jest-expo replaces fetch/Request/Response/Headers with React Native / expo implementations that
// MSW cannot read bodies from, so jest-environment.ts puts the Node versions back for tests.
const NativeEnvironment = require('jest-expo/src/preset/nativeEnvironment')

const FETCH_GLOBALS = ['fetch', 'Request', 'Response', 'Headers']

class MswCompatibleEnvironment extends NativeEnvironment {
  constructor(config, context) {
    super(config, context)
    this.global.__NODE_FETCH_GLOBALS__ = Object.fromEntries(
      FETCH_GLOBALS.map((name) => [name, this.global[name]]),
    )
  }
}

module.exports = MswCompatibleEnvironment
module.exports.TestEnvironment = MswCompatibleEnvironment
