import {checkOptionsName} from "../../../src/adapter/error.adapter";

describe('Adapter Error Test', () => {
    test('Should return Internal Error', async () => {
        const name = checkOptionsName()
        expect(name).toBe("System Error")
    })

    test('Should return Bad Request', async () => {
        const name = checkOptionsName({ name: "Bad Request" })
        expect(name).toBe("Bad Request")
    })
})
