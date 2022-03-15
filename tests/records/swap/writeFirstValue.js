const { actions } = require("../../utils")

module.exports = async () => {
    await page.waitForSelector('div > .p-4 > #from > div > .d-flex:nth-child(2) > .c-input-field')
    await page.click('div > .p-4 > #from > div > .d-flex:nth-child(2) > .c-input-field')
    await actions.selectorType('div > .p-4 > #from > div > .d-flex:nth-child(2) > .c-input-field', "123")
}