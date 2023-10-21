import {Health} from "../../proto_gen/common_pb";
import {appConfig} from "../config";
import {serverLifetime} from "../utils/server";

export const getHealthService = (): Health => {
    // Compose result
    const health = new Health()
    health.setName(appConfig.serviceName)
    health.setVersion(appConfig.serviceVersion)
    health.setLifetime(serverLifetime.getTimestamp())

    return health
}