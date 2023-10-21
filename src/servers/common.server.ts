import {sendUnaryData, ServerUnaryCall} from "@grpc/grpc-js";
import {Empty} from "google-protobuf/google/protobuf/empty_pb";
import {Health} from "../../proto_gen/common_pb";
import {getHealthService} from "../services/common.service";

export const getHealthServer = (call: ServerUnaryCall<Empty, Health>, callback: sendUnaryData<Health>) => {
    const health = getHealthService()

    callback(null, health)
}
