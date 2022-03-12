let Selector = function (property, value, tag) {
    if (!new.target)
        return new Selector(property, value, tag)

    let _selector = ""

    if (tag)
        _selector += tag

    _selector += `[${property}="${value}"]`

    this.get = function () {
        return _selector
    }
}

module.exports = {
    actions: {
        textClick: async (text) => {
            let selector = Selector("text()", text, "//div").get()
            await page.waitForXPath(selector)
            let [btn] = await page.$x(selector)
            await btn.click()
        },

        ctrlV: async () => {
            await page.keyboard.down('ControlLeft')
            await page.keyboard.press('KeyV')
            await page.keyboard.up('ControlLeft')
        },

        selectorClick: async (selector) => {
            await page.waitForSelector(selector)
            await page.click(selector)
        },

        selectorType: async (selector, text) => {
            await page.waitForSelector(selector)
            await page.type(selector, text)
        },

        selectorGetText: async (selector) => {
            await page.waitForSelector(selector)
            return await page.$eval(selector, el => el.textContent)
        }
    },

    /* ----------------------------------------------- */

    selectors: {
        inPlaceholder : (text) => {
            return Selector("placeholder", text, "input").get()
        },

        imgSrc : (src) => {
            return Selector("src", src, "img").get()
        }
    }
}