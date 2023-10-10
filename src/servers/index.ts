import {Server} from "@grpc/grpc-js";
import {AuthService} from "../../proto_gen/auth-svc_grpc_pb";
import {getHealthServer} from "./common";
import {createAnonymousCustomerTokenServer} from "./anonymous";

export class AuthServer extends Server {
    initRoutes(): void {
        // Auth Service Route
        this.addService(AuthService, {
            getHealth: getHealthServer,

            // Anonymous
            createCustomerAnonymousToken: createAnonymousCustomerTokenServer
        })
    }
}