import {serverLifetime} from "../../../src/utils/server";

describe('Utils Server Test', () => {
    test('serverLifetime test', () => {
        expect(serverLifetime.startTime).toBe(0)

        // set start time
        const startTime = new Date().getTime()
        serverLifetime.setStartTime(startTime)
        expect(serverLifetime.startTime).toBe(startTime)

        // get server lifetime
        expect(serverLifetime.getTimestamp() == startTime).toBe(false)
    })
})