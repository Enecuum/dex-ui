module.exports = async () => {
    await page.waitForSelector('#to > div > .d-flex > .d-flex > .token-button')
    await page.click('#to > div > .d-flex > .d-flex > .token-button')

    await page.waitForSelector('#token-filter-field')
    await page.click('#token-filter-field')

    await page.waitForSelector('.modal-body > .d-flex > .d-flex > .d-flex > .icon-Icon15')
    await page.click('.modal-body > .d-flex > .d-flex > .d-flex > .icon-Icon15')

    await page.waitForSelector('.modal-body > div > .row:nth-child(1) > .col > .c-toggle')
    await page.click('.modal-body > div > .row:nth-child(1) > .col > .c-toggle')

    await page.waitForSelector('.modal-content > .pb-0 > .w-100 > .row > .mx-2')
    await page.click('.modal-content > .pb-0 > .w-100 > .row > .mx-2')

    await page.waitForSelector('.modal-content > .modal-body > #tokensList > div:nth-child(2) > .d-flex')
    await page.click('.modal-content > .modal-body > #tokensList > div:nth-child(2) > .d-flex')
}