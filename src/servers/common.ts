import {sendUnaryData, ServerUnaryCall} from "@grpc/grpc-js";
import {Empty} from "google-protobuf/google/protobuf/empty_pb";
import {Health} from "../../proto_gen/common_pb";
import {serverLifetime} from "../utils/server";
import {config} from "../config";
import {getHealthService} from "../services/common";

export const getHealthServer = (call: ServerUnaryCall<Empty, Health>, callback: sendUnaryData<Health>) => {
    const health = getHealthService()

    callback(null, health)
}
