import 'regenerator-runtime/runtime'

describe("SwapCard UI test", () => {
    beforeAll(async () => {
        await page.goto('http://localhost:1234')
    })

    it ('asd', async () => {
        await page.screenshot({ path: 'example.png' });
    })
})