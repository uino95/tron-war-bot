const puppeteer = require('puppeteer');

const makeScreenshot = async function {
  const browser = await puppeteer.launch()
  const page = await browser.newPage();
  await page.goto('https://test.tronwarbot.com');
  await page.waitFor('#chartdiv',{visible:true, timeout: 60000});
  // const chart = await page.$('#chartdiv');
  await page.screenshot({path:'mapScreenshot.jpeg', type:'jpeg', quality:100, clip:{x: 0, y:100, width: 750, height: 500}, })
  // await page.screenshot();
  await browser.close();
}

module.exports = {
  makeScreenshot
}

