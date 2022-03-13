import 'regenerator-runtime/runtime'

const preparations = require("./preparations.test")
// const records = require("./records/index")
//
// const { actions, selectors } = require("./utils")


describe("SwapCard UI test", () => {
    preparations()

    describe("test case", () => {
        test("test action", () => {
            expect(true).toBe(true)
        })
    })
})