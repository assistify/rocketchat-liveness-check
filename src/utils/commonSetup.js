const fs = require('fs');
const SCREENSHOTS_DIR_PATH = './.screenshots';

function run(){
    if (!fs.existsSync(SCREENSHOTS_DIR_PATH)){
        fs.mkdirSync(SCREENSHOTS_DIR_PATH);
    }
}

module.exports = {
    run,
    SCREENSHOTS_DIR_PATH
}