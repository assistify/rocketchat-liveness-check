const login = require('./login');

async function validateLogin(server, user, password) {
    try {
        await login(server, user, password)
        console.info('Completed login and logout successfully')
        process.exit(0)
    } catch (e) {
        switch (e.message) {
            case 'server-not-reached':
                console.error('Server could not be reached - check address', e)
                process.exit(2);
                break;
            case 'user-not-found':
                console.error('Liveness-probe technical user not found', e)
                process.exit(3);
                break;
            default:
                console.error('Could not log in and log out again', e)
                process.exit(1); // enforce an exist code so that you can check this in a bash based health check
        }
    }
}

function runServer(server, user, password) {
  const express = require('express')
  const app = express()
  const status = {result: undefined}

  async function updateStatus() {
    try {
      status.result = await login(server, user, password)
      delete status.error
    } catch (e) {
      status.result = false
      status.error = e
    }
    setTimeout(updateStatus, process.env.UPDATE_INTERVAL || 60000)
  }

  updateStatus()
  app.get('/', (req, res) => res.json(status))
  app.listen(process.env.PORT || 3003)
}

const server = process.env.SERVER || 'http://localhost:3000'
const user = process.env.ASSISTIFY_USER || 'liveness'
const password = process.env.ASSISTIFY_PASSWORD || '1iveness!'

if (process.argv.some(arg => arg === '--server')) {
  runServer(server, user, password)
} else {
  validateLogin(server, user, password)
}
