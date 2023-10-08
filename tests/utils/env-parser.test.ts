import {getEnvNumber, getEnvString} from "../../src/utils/env-parser";

describe('Utils Env Parser Test', () => {
    test('getEnvNumber() Should return default value', () => {
        process.env.TEST = "a"
        const val = getEnvNumber("TEST", 5)
        expect(val).toBe(5)
    })

    test('getEnvNumber() Should return 10', () => {
        process.env.TEST = "10"
        const val = getEnvNumber("TEST", 5)
        expect(val).toBe(10)
    })

    test('getEnvString() Should return default value', () => {
        const val = getEnvString("TEST_STRING", "test")
        expect(val).toBe("test")
    })

    test('getEnvString() Should return "diff"', () => {
        process.env.TEST_STRING = "diff"
        const val = getEnvString("TEST_STRING", "test")
        expect(val).toBe("diff")
    })
})
