import { appConfig } from "../../../src/config";
import {getHealthService} from "../../../src/services/common";

describe('Service Common Test', () => {
    test('getHealthService Test', () => {
        appConfig.serviceName = 'testService'
        appConfig.serviceVersion = 'v1.0.0'

        const health = getHealthService()
        expect(health.getName()).toBe('testService')
        expect(health.getVersion()).toBe('v1.0.0')
    })
})
