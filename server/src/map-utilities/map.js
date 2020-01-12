const puppeteer = require('puppeteer');
const path = require('path');
const utils = require('../utils')

const takeScreenshot = async () => {
  const browser = await puppeteer.launch({headless: true})
  const page = await browser.newPage();
  await page.goto('https://tronwarbot.com');
  await page.waitFor('#chartdiv',{visible:true, timeout: 60000});
  await utils.sleep(5000)
  // const chart = await page.$('#chartdiv');
  await page.screenshot({path:path.join(__dirname,'../img/map.jpg'), type:'jpeg', quality:100, clip:{x: 0, y:100, width: 750, height: 500}, })
  // await page.screenshot();
  console.log("[MAP]: Screenshot taken successfully")
  await browser.close();
}

module.exports = {
  takeScreenshot
}
