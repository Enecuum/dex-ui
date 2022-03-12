module.exports = async () => {
    await page.waitForSelector('#root > div > .navbar > #root-connect > .btn')
    await page.click('#root > div > .navbar > #root-connect > .btn')

    await page.waitForSelector('.modal > .modal-dialog > .modal-content > .modal-body > .enq-wallet')
    await page.click('.modal > .modal-dialog > .modal-content > .modal-body > .enq-wallet')
}