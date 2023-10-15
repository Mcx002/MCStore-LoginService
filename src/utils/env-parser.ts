import dotenv from 'dotenv'
import {Status} from "@grpc/grpc-js/build/src/constants";
import {ErrorHandler} from "../adapter/error";

export const isNodeEnvTest = process.env.NODE_ENV === 'test'

export const getEnvPath = (isTest: boolean) => {
    return `.env${isTest ? '.test' : ''}`
}

export const loadEnvFile = () => {
    dotenv.config({ path: getEnvPath(isNodeEnvTest) })
}

export function validateDefaultValue<T>(variableName: string, defaultValue: T | undefined): T {
    if (!defaultValue) {
        throw new ErrorHandler(Status.INTERNAL, `${variableName} is not set yet`)
    }

    return defaultValue
}

export const getEnvNumber = (variableName: string, defaultValue: number | undefined = undefined): number => {
    const data = process.env[variableName]
    if (!data) {
        return validateDefaultValue(variableName, defaultValue)
    }

    const dataNumber = parseInt(data)
    if (Number.isNaN(dataNumber)) {
        return validateDefaultValue(variableName, defaultValue)
    }

    return dataNumber
}

export const getEnvString = (variableName: string, defaultValue: string | undefined = undefined): string => {
    const data = process.env[variableName]

    // return if data exists
    if (data) {
        return data
    }

    // throw error if data doesn't exist and default value not set
    return validateDefaultValue(variableName, defaultValue)
}