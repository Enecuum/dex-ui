module.exports = async () => {
    await page.waitForSelector('.accordion > .routing-card > .p-0 > .routing-button > .icon-Icon26')
    await page.click('.accordion > .routing-card > .p-0 > .routing-button > .icon-Icon26')
}