const puppeteer = require('puppeteer');
const commonSetup = require('./utils/commonSetup');

(async () => {
  commonSetup.run();
  const server = process.env.SERVER || 'http://localhost:3000'
  const user = process.env.ASSISTIFY_USER || 'liveness'
  const password = process.env.ASSISTIFY_PASSWORD || '1iveness!'

  const browser = process.env.CHROME ? await puppeteer.launch({executablePath: process.env.CHROME, args: ['--no-sandbox', '--disable-setuid-sandbox']}) : await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']}) 
  const page = await browser.newPage()

  // make sure we're at a width with which we can see the sidepanel if logged in
  await page.setViewport({ width: 1440, height: 748 })

  await page.goto(`${server}`)

  await page.waitForSelector('input#emailOrUsername')
  await page.type('input#emailOrUsername', user)
  await page.type('input#pass', password)

  await page.click('button.login')
  try {
    await page.waitForSelector('#toast-container', {timeout: 3000})
    console.error('User not Found')
    process.exit(0);
  }
  catch {
    
  }
  try {
    await page.waitForSelector('.avatar', { timeout: 10000 })

    // bring up user menue
    await page.click('.avatar')

    // and log out
    await page.waitForSelector('.rc-popover--sidebar-header .rc-popover__column ul:last-of-type li:last-of-type')
    await page.click('.rc-popover--sidebar-header .rc-popover__column ul:last-of-type li:last-of-type')

    // Check we're back to login screen
    await page.waitForSelector('input#emailOrUsername')

    console.info('Completed login and logout successfully')
  } catch (e) {
    await page.screenshot({ path: `${ commonSetup.SCREENSHOTS_DIR_PATH }/login-failed.png` });
    await browser.close()
    console.error(e)
    console.error('Could not log in and log out again')

    process.exit(1); // enforce an exist code so that you can check this in a bash based health check
  }

  await browser.close()
})()