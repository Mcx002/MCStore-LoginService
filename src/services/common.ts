import {Health} from "../../proto_gen/common_pb";
import {config} from "../config";
import {serverLifetime} from "../utils/server";

export const getHealthService = (): Health => {
    // Compose result
    const health = new Health()
    health.setName(config.serviceName)
    health.setVersion(config.serviceVersion)
    health.setLifetime(serverLifetime.getTimestamp())

    return health
}