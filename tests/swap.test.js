import 'regenerator-runtime/runtime'

const preparations = require("./preparations.test")
const records = require("./records/index").swap
const balances = require("../server/testPlugData/balanceAll")

const { actions, selectors } = require("./utils")


describe("SwapCard UI test", () => {

    preparations()

    describe("TC1 - Пара BIT/ENX. Продажа 123 BIT", () => {
        test("Проверка тикера первого актива", async () => {
            await actions.sleep(5000)
            let actualTicker = await actions.selectorGetText("#from > div > .d-flex > .d-flex > .token-button > .d-flex > div > .d-flex > span")
            expect(actualTicker).toMatch("BIT")
        })

        test("Проверка баланса первого актива", async () => {
            let actualBalance = await actions.selectorGetText(".p-4 > #from > div > .d-flex > .my-token-amount")
            expect(actualBalance).toMatch("Balance: 5,581.1668956805")
        })

        test("Выбор ENX в качестве второго токена", async () => {
            await records.selectSecondENX()
        })

        test("Проверка тикера второго актива", async () => {
            let actualTicker = await actions.selectorGetText("#to > div > .d-flex > .d-flex > .token-button > .d-flex > div > .d-flex > span")
            expect(actualTicker).toMatch("ENX")
        })

        test("Проверка баланса второго актива", async () => {
            let actualBalance = await actions.selectorGetText(".p-4 > #to > div > .d-flex > .my-token-amount")
            expect(actualBalance).toMatch("Balance: 19.1943930779")
        })

        test("Установка значения на продажу в размере 123 BIT", async () => {
            await records.writeFirstValue()
        })

        test("Проверка получаемых ENX", async () => {
            await new Promise(resolve => setTimeout(resolve, 2000)) // wait for the router
            let actualValue = await actions.selectorGetValue("div > .p-4 > #to > div > .d-flex:nth-child(2) > .c-input-field")
            expect(actualValue).toMatch("0.7477410908")
        })

        test("Проверка обменного курса BIT к ENX", async () => {
            let actualExchangeRate = await actions.selectorGetText("div > .p-4 > .my-2 > .py-2 > .pl-4")
            expect(actualExchangeRate).toMatch("162.9981669043 BIT per ENX")
        })

        test("Открытие аккордеона роутера", async () => {
            await records.openRouter()
        })

        test("Проверка комиссии пула", async () => {
            let actualPoolFee = await actions.selectorGetText(".collapse > .pb-2 > .swap-route > .routing-pool-wrapper > .text-pairs")
            expect(actualPoolFee).toMatch("0.3%")
        })

        test("Проверка расчётных значений роутера", async () => {
            let actualFromValue = await actions.selectorGetText("div > .d-flex > .col-5:nth-child(1) > .d-flex > .full-routing-amounts")
            let actualToValue = await actions.selectorGetText("div > .d-flex > .col-5:nth-child(3) > .d-flex > .full-routing-amounts")
            let actualFromTicker = await actions.selectorGetText("div > .d-flex > .col-5:nth-child(1) > .d-flex > .text-muted")
            let actualToTicker = await actions.selectorGetText("div > .d-flex > .col-5:nth-child(3) > .d-flex > .text-muted")
            expect(actualFromValue).toMatch("123.0000000000")
            expect(actualFromTicker).toMatch("BIT")
            expect(actualToValue).toMatch("0.7477410908")
            expect(actualToTicker).toMatch("ENX")
        })

        test("Проверка минимальной суммы на получение (slippage tolerance = 0.01%)", async () => {
            let actualMinimumReceived = await actions.selectorGetText(".swap-card-wrapper > .addon-card-wrapper > .general-card > .d-block:nth-child(1) > div:nth-child(2)")
            expect(actualMinimumReceived).toMatch("0.7476663167 ENX")
        })

        test("Проверка влияния на цену", async () => {
            let actualPriceImpact = await actions.selectorGetText(".addon-card-wrapper > .general-card > .d-block > div > .text-color3")
            expect(actualPriceImpact).toMatch("0.9102218332%")
        })

        test("Проверка комиссии поставщика ликвидности", async () => {
            let actualLiquidityProviderFee = await actions.selectorGetText(".swap-card-wrapper > .addon-card-wrapper > .general-card > .d-block:nth-child(3) > div:nth-child(2)")
            expect(actualLiquidityProviderFee).toMatch("36.9 BIT")
        })
    })
})