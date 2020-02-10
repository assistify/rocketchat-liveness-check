const login = require('./login')

module.exports = {
  login,
  runAsServer: login.runAsServer,
  openBrowser: login.openBrowser,
  performTest: login.performTest
}
