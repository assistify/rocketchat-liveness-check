const puppeteer = require('puppeteer');
const commonSetup = require('./utils/commonSetup');
const AutomationError = require('./utils/AutomationError')
const express = require('express')

const login = async function (server='http://localhost:3000', user='liveness', password='1iveness!', chromePath=process.env.CHROME, logger, measureTime = true){
  logger = logger || console
  const browser = await setupBrowser(chromePath)
  const page = await browser.newPage()

  try {
    const result = await performTest(page, server, user, password, measureTime)
    const additionalInfo = result.info && result.info.messageSendDuration

    logger.debug(`Liveness check on ${server}: Completed login and logout successfully. ${additionalInfo || ''}`)
  } catch (e) {
    logger.error(e)
    await page.screenshot({ path: `${ commonSetup.SCREENSHOTS_DIR_PATH }/login-failed.png` })
    throw e;
  } finally {
    await browser.close()
  }

  return true;
};

async function setupBrowser(chromePath) {
  commonSetup.run();

  const args = ['--no-sandbox', '--disable-setuid-sandbox']
  const options = {ignoreHTTPSErrors: true, args, headless: !process.env.DEBUG}
  if (chromePath) {
    options.executablePath = chromePath
  }
  return puppeteer.launch(options)
}

async function runAsServer(chromePath=process.env.CHROME, measureTime=true) {
  const app = express()
  const browser = await setupBrowser(chromePath)
  const page = await browser.newPage()

  app.get('/login', async (req, res) => {
    try {
      res.json(await performTest(page, req.query.server, req.query.user, req.query.password, measureTime))
    } catch (error) {
      res.status(error.status || 500).json({error})
    }
  })
  app.listen(7000)
}

async function performTest(page, server, user, password, measureTime) {
  let info

  // make sure we're at a width with which we can see the sidepanel if logged in
  try {
    await page.setViewport({width: 1440, height: 748})

    await gotoMainpage(page)
    await doLogin(page)
    await waitForAvatar(page)
    if (measureTime) {
      info = {messageSendDuration: await measureMessageTime(page)}
    }
    await doLogout(page)

    return {ok: true, info}
  } catch (error) {
    throw error
  }

  async function gotoMainpage() {
    try {
      await page.goto(server, {timeout: 10000})
    } catch (error) {
      throw new AutomationError('server-not-reached', {server, error, status: 503})
    }
  }

  async function doLogin() {
    await page.waitForSelector('input#emailOrUsername')
    await page.type('input#emailOrUsername', user)
    await page.waitForSelector('input#pass')
    await page.type('input#pass', password)  
    await page.waitForSelector('button.login')
    await page.click('button.login')
    try {
      await page.waitForSelector('#toast-container', {timeout: 3000})
    } catch (e) {
      // all went well: the toast container with the error message didn't appear
      return
    }
    throw new AutomationError('user-not-found', {server, user, status: 511})
  }

  async function waitForAvatar() {
    try {
      await page.waitForSelector('.avatar', { timeout: 30000 })
    } catch (error) {
      throw new AutomationError('login-failed', {server, error, status: 504})
    }
  }

  async function measureMessageTime() {
    try {
      await page.goto(`${server}/direct/${user}`)
      await page.waitForSelector('.js-input-message')
      const start = new Date()
      await page.type('.js-input-message', +start + '\n')
      await page.waitForFunction(() => document.querySelectorAll('.message.temp').length === 0)
      await page.keyboard.press('ArrowUp')
      await page.evaluate(() => document.querySelector('.js-input-message').value = '')
      const duration = (new Date() - start) + 'ms'
      await page.type('.js-input-message', duration + '\n')
      await page.waitFor(1000)
      await page.type('.js-input-message', 'waiting...')
      await page.waitFor(3000)
      await page.evaluate(() => document.querySelector('.js-input-message').value = '')
      return duration
    } catch (error) {
      throw new AutomationError('time-measurement-failed', {server, error, status: 504})
    }
  }

  async function doLogout() {
    // bring up user menue
    await page.click('.avatar')

    // and log out
    await page.waitForSelector('.rc-popover--sidebar-header .rc-popover__column ul:last-of-type li:last-of-type')
    await page.click('.rc-popover--sidebar-header .rc-popover__column ul:last-of-type li:last-of-type')

    // Check we're back to login screen
    await page.waitForSelector('input#emailOrUsername')
  }  
}

module.exports = login
module.exports.runAsServer = runAsServer
