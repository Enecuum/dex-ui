const path = require("path")
const config = require(path.resolve(__dirname, "../config.json"))

const { actions, selectors } = require("./utils")
const records = require("./records/index")

const EXTENSION_URL = config.test.chromeExtension.url
const TEST_PASSWORD = config.test.account.password


module.exports = () => {
    beforeAll(async () => {
        // ----------------- Login
        await page.goto(EXTENSION_URL)
        await actions.selectorType(selectors.inPlaceholder("New password"), TEST_PASSWORD)
        await actions.selectorType(selectors.inPlaceholder("Confirm password"), TEST_PASSWORD)
        await actions.textClick("Save")
        await actions.textClick("Generate")
        await actions.textClick("Copy")
        await actions.textClick("Back")
        await actions.selectorClick(selectors.inPlaceholder("12+ words"))
        await actions.ctrlV()
        await actions.textClick("Login")

        // ----------------- Import wallet
        await actions.selectorClick(selectors.imgSrc("./images/icons/5.png"))
        await actions.textClick("Accounts")
        await actions.textClick("Import Key")
        await actions.selectorType(selectors.inPlaceholder("64 symbols long random string"), config.test.account.prvkey)
        await actions.textClick("Import Key")
        await actions.textClick("❮ Back")
        await page.reload()

        // ----------------- Open ENEX page
        await page.goto(`http://localhost:${config.dex_port}`)
    })

    describe("Connect Enecuum wallet", () => {
        test ("Connect in ENEX page", async () => {
            await records.connection()
        })

        test ("Connect in extension", async () => {
            await page.goto(EXTENSION_URL)
            await actions.textClick("Activity ")
            await actions.textClick("Share account address")
            await actions.textClick("Allow")
        })

        test ("Open ENEX page", async () => {
            await page.goto(`http://localhost:${config.dex_port}`)
        })

        test ("Check connection state", async () => {
            let addr = await actions.selectorGetText("#root-connect > .d-none > .wallet-info-wrapper > .wallet-info-boxes > .addr")
            expect(addr).toMatch("0x03c91e...e2a8")
        })
    })
}