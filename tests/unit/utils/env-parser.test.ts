import {
    getEnvNumber,
    getEnvPath,
    getEnvString,
    isNodeEnvTest,
    loadEnvFile,
    validateDefaultValue
} from "../../../src/utils/env-parser";
import dotenv from "dotenv";

describe('Utils Env Parser Test', () => {
    test('getEnvNumber() Should return default value', () => {
        process.env.TEST = "a"
        const val = getEnvNumber("TEST", 5)
        expect(val).toBe(5)
    })

    test('getEnvNumber() Should return default value when env variable is not set yet', () => {
        const val = getEnvNumber("TEST2", 5)
        expect(val).toBe(5)
    })

    test('getEnvNumber() Should return error that env variable is not set yet', () => {
        expect(() => getEnvNumber("TEST2", undefined)).toThrow('TEST2 is not set yet')
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

    test('validateDefaultValue Should throw variableName is not set yet', () => {
        const variableName = 'TEST3'
        expect(() => validateDefaultValue(variableName, undefined)).toThrow(`${variableName} is not set yet`)
    })

    test('validateDefaultValue should return defaultValue', () => {
        const variableName = 'TEST3'
        const data = validateDefaultValue(variableName, 'test')
        expect(data).toBe('test')
    })

    test('Should return service name TestAuthService', () => {
        loadEnvFile()
        const serviceName = getEnvString("SERVICE_NAME")
        expect(serviceName).toBe('TestAuthService')
    })

    test('Should return service name AuthService', () => {
        delete process.env.SERVICE_NAME
        dotenv.config()
        const serviceName = getEnvString("SERVICE_NAME")
        expect(serviceName).toBe('AuthService')
    })

    test("Should return .env", () => {
        const path = getEnvPath(false)
        expect(path).toBe(".env")
    })

    test("Should return .env.test", () => {
        process.env.NODE_ENV = 'test'
        const path = getEnvPath(true)
        expect(path).toBe(".env.test")
    })
})
