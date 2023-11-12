import { sendUnaryData, ServerErrorResponse, ServerUnaryCall } from "@grpc/grpc-js";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";
import { Health } from "../../proto_gen/common_pb";
import { getHealthService } from "../services/common.service";
import { logger } from "../logger";

export const getHealthServer = (call: ServerUnaryCall<Empty, Health>, callback: sendUnaryData<Health>) => {
    try {
        const health = getHealthService()

        callback(null, health)
    }
    catch (e: unknown) {
        const err = e as ServerErrorResponse
        logger.error(JSON.stringify(err))
        callback(err, null)
    }
}
