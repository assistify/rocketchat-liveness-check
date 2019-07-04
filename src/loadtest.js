const puppeteer = require('puppeteer');
const commonSetup = require('./utils/commonSetup');
const AutomationError = require('./utils/AutomationError')

const login = async function (server='http://localhost:3000', user='liveness', password='1iveness!', chromePath=process.env.CHROME){
  commonSetup.run();

  const args = ['--no-sandbox', '--disable-setuid-sandbox']
  const browser = chromePath ? await puppeteer.launch({executablePath: chromePath, args}) : await puppeteer.launch({args})
  const page = await browser.newPage()

  // make sure we're at a width with which we can see the sidepanel if logged in
  await page.setViewport({ width: 1440, height: 748 })

  try{
    await page.goto(server, {timeout: 10000})
  } catch(e) {
    throw new AutomationError('server-not-reached', {server, previous: e})
  }

  await page.waitForSelector('input#emailOrUsername')
  await page.type('input#emailOrUsername', user)
  await page.type('input#pass', password)

  await page.click('button.login')
  try {
    await page.waitForSelector('#toast-container', {timeout: 3000})
    await register(user)
    console.log('REGISTER SUCCESSFUL')
    throw new AutomationError('continue after register')
  }
  catch (e) {
    try{
      await page.waitForSelector('.avatar', { timeout: 30000 })
    }
    catch (e) {
      await page.screenshot({ path: `${ commonSetup.SCREENSHOTS_DIR_PATH }/login-failed.png` });
      await browser.close()
      throw new AutomationError('login-failed', {previous: e})
    }
    // we didn't get an error, everything as expected
    try {
      await page.goto(`${server}/direct/${user}`)
      await page.waitForSelector('.js-input-message')
      console.log('START WRITING MESSAGES')
      while (true) {
        await sendMessage()
      }
    } catch (e) {
      await page.screenshot({path: `${commonSetup.SCREENSHOTS_DIR_PATH}/login-failed.png`});
    }
  }

  return true;

  async function sendMessage() {
    const start = new Date()
    await page.type('.js-input-message', + start + ' (start)\n')
    await page.waitForFunction(() => document.querySelectorAll('.message.temp').length === 0)
    await page.keyboard.press('ArrowUp')
    await page.evaluate(() => document.querySelector('.js-input-message').value = '')
    await page.type('.js-input-message', (new Date() - start) + 'ms\n')
    console.log((new Date() - start) + 'ms')
    await page.waitFor(1000)
  }

  async function register(username) {
    await page.click('button.register')
    await page.waitForSelector('#name')

    await page.type('#name', username)
    await page.type('#email', username+'@loadtest.com')
    await page.type('#pass', username)
    await page.type('#confirm-pass', username)

    await page.click('button.login')

    await page.waitForSelector('#username')
    await page.type('#username', '')
    await page.click('button.login')
  }
};

module.exports = login
