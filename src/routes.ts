import {Server} from "@grpc/grpc-js";
import {AuthService} from "../proto_gen/auth-svc_grpc_pb";
import {getHealthServer} from "./servers/common";

// Initiate Server
export const server = new Server()

// Auth Service Route
server.addService(AuthService, {
    getHealth: getHealthServer
})
