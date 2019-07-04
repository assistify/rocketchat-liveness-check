const login = require('./login');
const loadtest = require('./loadtest');

async function validateLogin(server, user, password) {
    try {
        await login(server, user, password)
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

const server = process.env.SERVER || 'http://localhost:3000'
const user = process.env.ASSISTIFY_USER || 'liveness'
const password = process.env.ASSISTIFY_PASSWORD || '1iveness!'

if (process.argv.includes('--loadtest')) {
    loadtest(server, user, password);
} else {
    validateLogin(server, user, password);
}
