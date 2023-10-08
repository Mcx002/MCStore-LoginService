import 'dotenv/config'
export const getEnvNumber = (variableName: string, defaultValue: number): number => {
    const data = process.env[variableName]
    if (!data) {
        return defaultValue
    }

    const dataNumber = parseInt(data)
    if (Number.isNaN(dataNumber)) {
        return defaultValue
    }

    return parseInt(data)
}

export const getEnvString = (variableName: string, defaultValue: string): string => {
    const data = process.env[variableName]
    if (!data) {
        return defaultValue
    }

    return data
}